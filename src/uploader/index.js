import { EventEmitter } from "events";
import httprequest from "../core/httprequest";


/**
* Utility method to format bytes into the most logical magnitude (KB, MB,
* or GB).
*/
/*function formatBytes(number) {
        var units = ['B', 'KB', 'MB', 'GB', 'TB'],
            //bytes = this,
            i;

        for (i = 0; bytes >= 1024 && i < 4; i++) {
            bytes /= 1024;
        }

        return bytes.toFixed(2) + units[i];
}*/

function upload(upl)
{
    upl._started = true;

    let self = upl;

    setTimeout(function () {
            
            // Prevent range overflow
        if (self._range_end > self._file.size) {
                //self.range_end = self.file_size;
            throw "Invalid Range On Upload!";
        }

            //console.log("re2 " + self._range_end + " " + self._range_start + " " + self._opt.chunk_size);

        let chunk = self._file[self._slice_method](self._range_start, self._range_end);
        let chunk_id = Math.ceil(self._range_start / self._opt.chunk_size);
            
        let opt   = {headers:
        {
            "Content-Type" : "application/octet-stream"
                                  , "Content-Range": "bytes " + self._range_start 
                                        + "-" + self._range_end + "/" + self._file.size
                                  , "file-name": self._opt.name
                                  , "chunkid" : chunk_id.toString()
        }
        };

        if(null != self._opt.owner){
            opt.headers["owner"] = self._opt.owner;
        }
        if(null != self._opt.id) {
            opt.headers["fileid"] = self._opt.id;
        } 
                           
        let http = new httprequest(opt);
        http.put(self._opt.url, chunk).then(
                                (/*res*/) => {
                                            //console.log("re3 " + self._range_end + " " + self._range_start + " " + self._opt.chunk_size);

                                    let n = new Number((self._range_start / self._opt.chunk_size) / (self._file.size / self._opt.chunk_size) * 100);

                                    let sn = n.toFixed(2);
                                    self._onProgress(sn);

                                            // If the end range is already the same size as our file, we
                                            // can assume that our last chunk has been processed and exit
                                            // out of the function.
                                    if (self._range_end === self._file.size) {
                                                    //console.log("upload completed"); 
                                        self._onUploadComplete();
                                    }
                                    else
                                            {

                                                    // Update our ranges
                                        self._range_start = self._range_end;
                                        self._range_end = self._range_start + self._opt.chunk_size;

                                                    // Prevent range overflow
                                        if (self._range_end > self._file.size) {
                                            self._range_end = self._file.size;
                                        }

                                                    // Continue as long as we aren't paused
                                        if (!self._is_paused) {
                                            upload(self);
                                        }                                
                                        
                                            
                                    }
                                }
                                ,  (err) => {self._raise_error(err);}
                                );
            
            
    }, 20);
}

export default class Uploader extends EventEmitter {
    constructor(file, options) {
        super();
    
        this._file        = file;
        this._started     = false;
        this._range_end   = 0;
        this._range_start = 0;
        this._is_paused   = true;
        

        let opt = {
            url : "/upload"
            , id : null
            , tag : null
            , name : file.name
            , owner: null
            , chunk_size : (1024 * 8) * 10
            , start_position : 0
        };

        if(null != options)
            this._opt = Object.assign(opt, options);
        else
        this._opt = opt;

        if ("mozSlice" in this._file) {
            this._slice_method = "mozSlice";
        }
        else if ("webkitSlice" in this._file) {
            this._slice_method = "webkitSlice";
        }
        else {
            this._slice_method = "slice";
        }
    
        this._range_start = this._opt.start_position;
        this._range_end   = this._range_start + this._opt.chunk_size;
        if(this._range_end > this._file.size)
            this._range_end = this._file.size;

     //console.log("re1 " + this._range_end + " " + this._range_start + " " + this._opt.chunk_size);
     //
     this.status       = "inizialized";
    }

    name() {return this._opt.name;}

    _raise_error(err){
           //console.log("uploader error: " + err.message);
        this._is_paused = true;
        this.status = "error";
        this.emit("error", err);
    }

    _onProgress(sn){this.emit("progress", sn);}
    _onUploadComplete(){
        this.status = "completed";
        this.emit("completed");
    }
  
    start() {
        this._is_paused = false;
        this.emit("start");
        this.status = "started";
        upload(this);
    }

    pause() {
        this._is_paused = true;

        this.status = "paused";
    }

    paused() { return this._is_paused;}

    resume() {
        this._is_paused = false;

        this.status = "started";
        upload(this);
    }

}


export class UploadManager extends EventEmitter {
    constructor(options) {
 
        super();
    

        let opt = {
              url : "/upload"
            , chunk_size : (1024 * 8) * 10
            , start_position : 0
        };

        if(null != options)
            this._opt = Object.assign(opt, options);
        else
        this._opt = opt;

        this.uploader = {};
    }

    setOptions(options)
    {
         this._opt = Object.assign(this._opt, options);
    }

     _raise_error(err, kid){this.emit("error", err, kid);}
     _onProgress(sn, kid){this.emit("progress", sn, kid);}
     _onUploadComplete(kid){this.emit("completed", kid);}

    add(file, id, options)
    {
        if(null != this.uploader[id])
        {
            throw 'uploader alredy exist';
        }

        let op = Object.assign(this._opt, options);
        let kid = id;
        let up = new Uploader(file, op);
            up.on('completed', () => {this._onUploadComplete(kid);});
            up.on('error', (err) => {this._raise_error(err, kid)});
            up.on('progress', (n) => { this._onProgress(n, kid);});


        this.uploader[id] = up;

        return up;
    }

    start(id){

        if(null != this.uploader[id])
        {
            throw 'invalid id';
        }

        this.uploader[id].start();

    }

    pause(id){

        if(null != this.uploader[id])
        {
            throw 'invalid id';
        }

        this.uploader[id].pause();

    }

    resume(id){

        if(null != this.uploader[id])
        {
            throw 'invalid id';
        }

        this.uploader[id].resume();

    }

    status(id)
    {
        if(null != this.uploader[id])
        {
            throw 'invalid id';
        }

        return this.uploader[id].status;
    }

    selectFiles(e)
    {
        let files = e.files;
        

                for (var i = 0; i < files.length; i++) {
                    let file = files[i];
                    
                    let id = file.name;
                        id = id.replace(".", "_");
                        id = id.replace(" ", "_");
                        id = id.replace("&", "_");
                        
                        this.add(file, id);
                        this.emit("new", id);

                }
        
     }



}


