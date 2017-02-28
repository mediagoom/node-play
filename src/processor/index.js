import { EventEmitter } from "events";
import path from 'path';
import cp   from 'child_process';
import fs   from 'fs';

function pad(num, size) {
    var s = "000000000000" + num;
    return s.substr(s.length-size);
}


export default class Processor extends EventEmitter {

     constructor(name, opt) {
        super();

        let defop = {
            destination : './'
            , cmd_img : "ffmpeg -t 100 -i \"$(file)\" -vf fps=1/10 \"$(dir)/img%03d.jpg\""
            , stream_rx : "Stream\\s#0:(\\d+)\\((\\w+)\\):\\s(Audio|Video):.*?(?:(?:,\\s(\\d+)x(\\d+))|(?:(\\d+) Hz)).*?, (\\d+) kb/s([^\\n]+)"
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

     get_streams(output)
     {
         //console.log(output);

         let regexp = new RegExp(this.options.stream_rx, 'g');
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

     read_stream_info(filepath)
     {
          return new Promise( (resolve, reject) => {
                
                let dir     = this.get_target_dir();
                let cmdline = this.options.cmd_img;
                    cmdline = cmdline.replace('$(file)', filepath);
                    cmdline = cmdline.replace('$(dir)' , dir);

                    console.log(cmdline);

                     fs.mkdir(dir, (e) => {
                        if(!e || (e && e.code === "EEXIST")){
          
                                cp.exec(cmdline, (err, stdout, stderr) =>{
                                    
                                    if(null != err)
                                    {
                                        reject(err);
                                    }
                                    else
                                    {
                                        resolve(this.get_streams(stdout + '\n' + stderr));
                                    }

                                    
                                });
                        }else
                        {reject(e);}
                     });

          
          
          });
     }


}
