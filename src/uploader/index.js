import { EventEmitter } from 'events';
import httprequest from '../core/httprequest';


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

            console.log("re2 " + self._range_end + " " + self._range_start + " " + self._opt.chunk_size);

            let chunk = self._file[self._slice_method](self._range_start, self._range_end);
            let chunk_id = Math.ceil(self._range_start / self._opt.chunk_size);
            
            let opt   = {headers:
                            {
                                    'Content-Type' : 'application/octet-stream'
                                  , 'Content-Range': 'bytes ' + self._range_start 
                                        + '-' + self._range_end + '/' + self._file.size
                                  , 'File-Name': self._opt.name
                                  , 'CHUNKID' : chunk_id.toString()
                            }
            }

            if (null != self._opt.id) {
               opt.headers['FILEID'] = self._opt.id;
            } 
                           
            let http = new httprequest(opt);
                http.put(self._opt.url, chunk).then(
                                (res) => {
                                            console.log("re3 " + self._range_end + " " + self._range_start + " " + self._opt.chunk_size);

                                            let n = new Number((self._range_start / self._opt.chunk_size) / (self._file.size / self._opt.chunk_size) * 100);

                                            let sn = n.toFixed(2);
                                            self._onProgress(sn);

                                            // If the end range is already the same size as our file, we
                                            // can assume that our last chunk has been processed and exit
                                            // out of the function.
                                            if (self._range_end === self._file.size) {
                                                self._onUploadComplete();

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
            url : '/upload'
            , id : null
            , tag : null
            , name : file.name
            , chunk_size : (1024 * 8) * 10
            , start_position : 0
    };

    if(null != options)
        this._opt = Object.assign(opt, options);
    else
        this._opt = opt;

        if ('mozSlice' in this._file) {
            this._slice_method = 'mozSlice';
        }
        else if ('webkitSlice' in this._file) {
            this._slice_method = 'webkitSlice';
        }
        else {
            this._slice_method = 'slice';
        }
    
     this._range_start = this._opt.start_position;
     this._range_end   = this._range_start + this._opt.chunk_size;
     if(this._range_end > this._file.size)
             this._range_end = this._file.size;

     console.log("re1 " + this._range_end + " " + this._range_start + " " + this._opt.chunk_size);
  }

   _raise_error(err){
           this._is_paused = true;
           this.emit('error', err);
   }

   _onProgress(sn){this.emit('progress', sn);}
   _onUploadComplete(){this.emit('completed');}
  
    start() {
            this._is_paused = false;
            this.emit('start');
            upload(this);
        }

    pause() {
            this._is_paused = true;
        }

    resume() {
            this._is_paused = false;
            upload(this);
        }

}




