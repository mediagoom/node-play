import { EventEmitter } from "events";
import path from "path";
import cp   from "child_process";
import fs   from "fs";

function pad(num, size) {
    var s = "000000000000" + num;
    return s.substr(s.length-size);
}


export default class Processor extends EventEmitter {

    constructor(name, opt) {
        super();

        let defop = {
            destination : "./"
            , cmd_img : "ffmpeg -t 100 -i \"$(file)\" -vf fps=1/10 \"$(dir)/img%03d.jpg\""
            , stream_rx : "Stream\\s#0:(\\d+)\\((\\w+)\\):\\s(Audio|Video):.*?(?:(?:,\\s(\\d+)x(\\d+))|(?:(\\d+) Hz)).*?, (\\d+) kb/s([^\\n]+)"
            , cmd_encode : "ffmpeg -i \"$(file)\" -vf \"scale=w=$(width):h=$(height)\" -codec:v libx264 -profile:v high -level 31 -b:v $(vb)k -r 25 -g 50 -sc_threshold 0 -x264opts ratetol=0.1 -minrate $(vb)k -maxrate $(vb)k -bufsize $(vb)k -b:a $(ab)k -codec:a aac -profile:a aac_low -ar 44100 -ac 2 -y $(outputfile)"
            , quality : [
                              {videobitrate: 120  , height : 144 }
                            , {videobitrate: 320  , height : 288 }
                            , {videobitrate: 750  , height : 576 }
                            , {videobitrate: 1200 , height : 720 }
                            , {videobitrate: 2000 , height : 720 }
                            , {videobitrate: 3500 , height : 720 }

            ]  

             , outputfile : "$(name)_$(width)_$(height)_$(vb).mp4"
             , audiobitrate : 96
            
        };

        if(null != opt)
            this.options = Object.assign(defop, opt);
        else
            this.options = defop;
        

        this._anchor = new Date(2100, 0, 0).getTime();
        this._create = Date.now();
        this.name    = name;

    }

    get_full_name()
    {
        let seconds = (this._anchor - this._create) / 1000;
        let n = pad(seconds.toFixed(0), 12);

        return n + "_" + this.name;
    }

    get_target_dir()
    {
        let target = path.join(this.options.destination, this.get_full_name());
        return path.resolve(target);
    }

    get_streams(output){

         ////console.log(output);

        let regexp = new RegExp(this.options.stream_rx, "g");
        let m = null;
        let streams = [];
        while ((m = regexp.exec(output)) !== null) {
            let s = { index : m[1]
                    , lang  : m[2]
                    , kind  : m[3]
                    , width : m[4]
                    , height: m[5]
                    , kz    : m[6]
                    , bps   : m[7]
            };

            streams.push(s);

        }
         //return { raw : output, match : m };
         //
         //
        
        streams.splice(-1, 1);


        return { raw : output, streams : streams };
    }

    mkdirr(cpath, callback)
    {
        let dirs = [];

        let ld = path.basename(cpath);

        let dir  = path.dirname(cpath);

        let last = "";

        //console.log(cpath, ld, dir);

        while(ld != last)
        {
            if(ld != "")
                dirs.push(ld);

            last = ld;
            ld   = path.basename(dir);
            dir  = path.dirname(dir);

            //console.log("--", dir, ld, last);
        }

        //console.log("--->", dirs);

        dirs.reverse();

        //console.log("+++>", dirs);

        function mk(dirc, dd, idx, rback)
        {
            //console.log("mk", dirc, dd, idx);

            fs.mkdir(dirc, (e) => {
                if(!e || (e && e.code === "EEXIST")){
                    
                    if(idx < (dd.length - 1))
                    {


                        let m = path.join(dirc, dd[idx + 1]);

                        mk(m, dd, idx + 1, rback);
                    }
                    else
                    {
                        rback(null);
                    }

                }
                else
                {rback(e);}
            });
        }

        mk(path.join(dir, dirs[0])
                , dirs, 0, callback);
    }

    read_stream_info(filepath){

        return new Promise( (resolve, reject) => {
                
            let dir     = this.get_target_dir();
            let cmdline = this.options.cmd_img;
            cmdline = cmdline.replace("$(file)", filepath);
            cmdline = cmdline.replace("$(dir)" , dir);

            ////console.log(cmdline);

            /*
            fs.mkdir(dir, (e) => {
                if(!e || (e && e.code === "EEXIST")){
          
                    cp.exec(cmdline, (err, stdout, stderr) =>{
                                    
                        if(null != err)
                                    {
                            reject(err);
                        }
                        else
                                    {
                            resolve(this.get_streams(stdout + "\n" + stderr));
                        }

                                    
                    });
                }else
                        {reject(e);}
            });
            */

            this.mkdirr(dir, (e) => {
                if(null != e)
            {
                    reject(e);
                }
                else
            {
                    cp.exec(cmdline, (err, stdout, stderr) =>{
                                    
                        if(null != err)
                    {
                            reject(err);
                        }
                        else
                    {
                            resolve(this.get_streams(stdout + "\n" + stderr));
                        }
                    });
                }

            });
          
        });
    }

    encode(filepath, streams)
    {
        return new Promise( (resolve, reject) => {
        
                
            if(streams.length != 2)
            {
                reject("at the moment only audio / video supported");
                return;
            }

            let video = null;
            let max   = 10000;

            for(let i = 0; i < streams.length; i++)
                {
                if(streams[i].kind === "Video")
                    {
                    if(video != null)
                        {
                        reject("more than one video stream unsupported");
                        return;
                    }

                    video = streams[i];
                    max   = video.bps + 100;
                }
            }

            console.log(video);
            console.log(max);

            let quality = this.options.quality.slice();
            let ratio   = video.width / video.height;
            let finished = false;

            //console.log(this.options.quality);
            console.log(quality);

            for(let i = 0; i < quality.length; i++){
                
                if(quality[i].videobitrate > max)
                    quality[i].videobitrate = 0;

                quality[i].width = (quality[i].height * ratio).toFixed(0);
                quality[i].done  = false;

                if(quality[i].videobitrate > 0){

                    let outputf = this.options.outputfile.replace("$(name)", this.name);
                    let cmdline = this.options.cmd_encode.replace("$(file)", filepath);
                                                    
                    cmdline = cmdline.replace("$(width)", quality[i].width);
                    outputf = outputf.replace("$(width)", quality[i].width);

                    cmdline = cmdline.replace("$(height)", quality[i].height);
                    outputf = outputf.replace("$(height)", quality[i].height);

                    cmdline = cmdline.replace(/\$\(vb\)/g, quality[i].videobitrate);
                    outputf = outputf.replace(/\$\(vb\)/g, quality[i].videobitrate);

                    cmdline = cmdline.replace("$(ab)", this.options.audiobitrate);
                    outputf = outputf.replace("$(ab)", this.options.audiobitrate);

                    outputf = path.join(this.get_target_dir(), outputf);

                    cmdline = cmdline.replace("$(outputfile)", outputf);

                    quality[i].file = outputf;

                    console.log(cmdline);

                    let idx = i;

                    cp.exec(cmdline, (err, stdout, stderr) =>{

                        if(finished)
                            return;
                                    
                        quality[idx].done  = true;

                        if(err)
                                {
                            finished = true;
                            console.log(stdout + stderr);
                            reject(err);
                                    
                        }
                        else
                                {
                            let completed = true;

                            for(let k = 0; k < quality.length; k++)
                                    {                                        
                                if(!quality[k].done)
                                        {
                                    completed = false;
                                }
                            }

                            if(completed)
                                    {
                                resolve(quality);
                            }
                        }



                    });
                }
                else
                    {
                    quality[i].done = true;
                }

            }
        
        });
    }






}
