import { EventEmitter } from "events";
import path from "path";
import cp   from "child_process";
import fs   from "fs";
import {parse} from "parse-spawn-args";

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
            , duration_rx : "Duration: (\\d\\d):(\\d\\d):(\\d\\d).(\\d\\d), start: ([\\d\\.]+), bitrate: (\\d+) kb/s"
            , stream_rx : "Stream\\s#0:(\\d+)(?:[\\(\\[](\\w+)[\\)\\]]){0,1}:\\s(Audio|Video):.*?(?:(?:,\\s(\\d+)x(\\d+))|(?:(\\d+) Hz)).*?, (?:(?:(\\d+) kb/s)|(?:stereo)|(?:.*? fps))"
            , cmd_encode : "-i \"$(file)\" -vf \"scale=w=$(width):h=$(height)\" -codec:v libx264 -profile:v high -level 31 -b:v $(vb)k -r 25 -g 50 -sc_threshold 0 -x264opts ratetol=0.1 -minrate $(vb)k -maxrate $(vb)k -bufsize $(vb)k -b:a $(ab)k -codec:a aac -profile:a aac_low -ar 44100 -ac 2 -y \"$(outputfile)\""
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
             , max_encoders: 2
            
        };

        if(null != opt)
            this.options = Object.assign(defop, opt);
        else
            this.options = defop;
        

        this._anchor = new Date(2100, 0, 0).getTime();
        this._create = Date.now();
        this.name    = name;

        if(null == this.options.id)
        {

            let seconds = (this._anchor - this._create) / 1000;
            let n = pad(seconds.toFixed(0), 12);

            this.id = n + "_" + this.name;
        }
        else
        {
            this.id = this.options.id;
        }

        this.finished = false;

    }

    get_full_name()
    {
        return this.id;
    }

    get_target_dir()
    {
        let target = path.join(this.options.destination, this.get_full_name());
        return path.resolve(target);
    }

    get_streams(output){

         ////console.log(output);
         //
        let regexpd = new RegExp(this.options.duration_rx, "g");
        let m = null;
        let kb = 0;

        if ((m = regexpd.exec(output)) !== null) {
            /*
            let hours = m[1];
            let minutes = m[2];
            let seconds = m[3];
            let milli   = m[4];
            let start   = m[5];
            */
            kb = m[6];
        
        }

        let regexp = new RegExp(this.options.stream_rx, "g");
        
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

            if(s.kind == "Video" && s.bps == null)
                s.bps = kb;

            if(s.lang == null)
                s.lang = "und";

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
                if(null != e){
                    reject(e);
                }
                else{

                    cp.exec(cmdline/*, {env: process.env}*/, (err, stdout, stderr) =>{
                                    
                        if(null != err){
                            reject(err);
                        }
                        else{
                            resolve(this.get_streams(stdout + "\n" + stderr));
                        }
                    });
                }

            });
          
        });
    }

    encode_file(resolve, reject, qua, i)
    {
        let quality = qua;
        let idx = i;

        const outs = fs.openSync(path.join(this.get_target_dir(), quality[idx].filename + "_out.log"), "a");
        const errs = fs.openSync(path.join(this.get_target_dir(), quality[idx].filename + "_err.log"), "a");

        quality[idx].status = "running";

        console.log("FFSPAWN", idx, quality[idx].args);
        
        let child = cp.spawn("ffmpeg", quality[idx].args
        , {                           
            stdio: [ "ignore", outs, errs ]
            , cwd: process.cwd()
            //, env: process.env
        });

        child.on("close", (code, signal) => {
            
            console.log("FFCLOSE", idx, code, signal, quality, this.finished);

            if(this.finished)
                return;

            if(0 != code)
            {
                let msg = "Invalid Return Code [" + code + " " + signal + "]";
                if(null == code)
                    msg += " The process is being terminated. Check you have enough resources to run it.";
                reject(new Error(msg ));
                return;
            }
                        
            quality[idx].done  = true;

            let completed = true;

            let running = 0;
            let spawn_id = -1;

            for(let k = 0; k < quality.length; k++){                                        
                if(!quality[k].done){
                    completed = false;
                    
                    if(quality[k].status == "running")
                        running++;

                    if(quality[k].status == "ready" && spawn_id === -1)
                        spawn_id = k;

                }
            }

            if(completed){
                this.finished = true;
                resolve(quality);
            }
            else
            {
                if(running < this.options.max_encoders && spawn_id >= 0)
                {
                    this.encode_file(resolve, reject, quality, spawn_id);
                }
            }
        });

        child.on("error", (err) => {
            
            if(err){

                this.finished = true;
                //console.log(stdout + stderr);
                reject(err);
                        
            }
        });
    }

    encode(filepath, streams)
    {
        
        return new Promise( (resolve, reject) => {
            
            if(!streams)
            {
                reject(new Error("invalid streams"));
                return;
            }
                
            if(streams.length != 2)
            {

                console.log("INVALID STREAMS", streams, streams.length);

                let err = new Error("at the moment only audio / video supported [" + streams.length.toString() + "]");
                reject(err);
                return;
            }

            let video = null;
            let max   = 10000;

            for(let i = 0; i < streams.length; i++){
                if(streams[i].kind === "Video"){
                    if(video != null){
                        reject( new Error("more than one video stream unsupported"));
                        return;
                    }

                    video = streams[i];
                    max   = new Number(video.bps);
                    max   += 100;
                }
            }

            //console.log(video);
            //console.log(max);
            //
            

            let quality = this.options.quality.slice();
            let ratio   = video.width / video.height;

            //console.log(this.options.quality);
            //console.log(quality);

            for(let i = 0; i < quality.length; i++){
                
                if(quality[i].videobitrate > max)
                    quality[i].videobitrate = 0;

                quality[i].width = (quality[i].height * ratio).toFixed(0);
                quality[i].done  = false;

                if(quality[i].width % 2)
                    quality[i].width = (new Number(quality[i].width) + 1);

                if(quality[i].height % 2)
                    quality[i].height = (new Number(quality[i].height) + 1);

                filepath = filepath.replace(/\\/g, "/");

                quality[i].status = "none";

                if(quality[i].videobitrate > 0){

                    let outputf = this.options.outputfile.replace("$(name)", this.name);
                    let cmdline = this.options.cmd_encode.replace("$(file)", filepath);
                                                   
                    cmdline = cmdline.replace("$(width)", quality[i].width);
                    outputf = outputf.replace("$(width)", quality[i].width);

                    cmdline = cmdline.replace("$(height)", quality[i].height);
                    outputf = outputf.replace("$(height)", quality[i].height);

                    cmdline = cmdline.replace(/\$\(vb\)/g, quality[i].videobitrate);
                    outputf = outputf.replace(/\$\(vb\)/g, quality[i].videobitrate);

                    quality[i].audiobitrate = this.options.audiobitrate;

                    cmdline = cmdline.replace("$(ab)", quality[i].audiobitrate);
                    outputf = outputf.replace("$(ab)", quality[i].audiobitrate);

                    quality[i].filename = outputf;

                    outputf = path.join(this.get_target_dir(), outputf);
                    outputf = outputf.replace(/\\/g, "/");

                    cmdline = cmdline.replace("$(outputfile)", outputf);

                    quality[i].file = outputf;

                    //console.log(cmdline);
                    
                    quality[i].args = parse(cmdline);

                    quality[i].status = "ready";

                }
                else{
                    quality[i].done = true;
                }

            }

            for(let i = 0; i < this.options.max_encoders; i++){

                let idx = i;

                this.encode_file(resolve, reject, quality, idx);

            }
                
            
        
        });
    }

    package(quality, subdir)
    {
        return new Promise( (resolve, reject) => {

            let outdir = path.join(this.get_target_dir(), subdir);

            this.mkdirr(outdir, (err) => {

                if(null != err){
                    reject(err);
                    return;
                }

                let args = [];
                args.push("-k:adaptive");
                args.push("-o:" + outdir);
                let first   = true;
                let cmdline = "";

                for(let i = 0; i < quality.length; i++){
                    if(null != quality[i].file){
            

                        if(first){
                            cmdline += "-i:";
                        }
                        else{
                            cmdline += "-j:";
                        }

                        cmdline += quality[i].file;
                        
                        args.push(cmdline);
                        cmdline = "";

                        args.push("-b:" + quality[i].videobitrate);
                        
                        if(first){
                            args.push("-s:0");
                            args.push("-e:0");
                        }
                        
                        first = false;
                    }
                }

                //console.log(args);
                
                const outs = fs.openSync(path.join(this.get_target_dir(), "mgout.log"), "a");
                const errs = fs.openSync(path.join(this.get_target_dir(), "mgerr.log"), "a");
                
                let child = cp.spawn("mg", args, {                           
                    stdio: [ "ignore", outs, errs ]
                        , cwd: process.cwd()
                        // , env: process.env
                });
                
                /*
                cmdline, (err, stdout, stderr) =>{
                 
                    if(null != err){
                        console.log(stdout + "\n" + stderr);
                        reject(err);
                        return;
                    }

                    resolve();
                 
                });
                */

                child.on("close", (code/*, signal*/) => {
                    if(0 == code){
                        resolve();
                    }
                    else{
                        reject(new Error("mg invalid return code " + code));
                    }
                });

                child.on("error", (err) => {
                    reject(err);
                });

                
            });
        });
    }
}
