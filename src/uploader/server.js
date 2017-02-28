import fs from "fs";

/**
 * Make a serializable error object.
 *
 * To create serializable errors you must re-set message so
 * that it is enumerable and you must re configure the type
 * property so that is writable and enumerable.
 *
 * @param {number} status
 * @param {string} message
 * @param {string} type
 * @param {object} props
 * @private
 */
function createError (status, message, type, props) {
    var error = new Error();

  // capture stack trace
    Error.captureStackTrace(error, createError);

  // set free-form properties
    for (var prop in props) {
        error[prop] = props[prop];
    }

  // set message
    error.message = message;

  // set status
    error.status = status;
    error.statusCode = status;

  // set type
    Object.defineProperty(error, "type", {
        value: type,
        enumerable: true,
        writable: true,
        configurable: true
    });

    return error;
}


export default function uplaoder(options){
        
    let opt = {
        base_path : "./"
            , limit : (10 * 1024 * 1024)
    };

    if(null != options)
        opt = Object.assign(opt, options);

    function append(p, f, b, complete/*, start*/){
                //console.log("------- chunk buffer -> ", Buffer.isBuffer(b), b.length);

        fs.mkdir(p, (e) => {
            if(!e || (e && e.code === "EEXIST")){
                fs.appendFile(f, b, {encoding : null}, (err) => {complete(err);});           //do something with contents
                              /* 
                              //console.log("append");

                              fs.open(f, 'a', (err, fd) => {
                                
                                      if(null != err)
                                      {
                                              //console.log(err);
                                              compleate(err);
                                      }
                                      else
                                      {
                                              //console.log("write", start);
                                              fs.write(fd, b, start, (err, written, buffer) => {
                                                      
                                                        //console.log("writeback", start);

                                                        if(null != err)
                                                        {
                                                                //console.log(err);
                                                                compleate(err);
                                                        }
                                                        else
                                                        {
                                                                //console.log("WRITTEN: ", written);
                                                                fs.close(fd, (err) => {
                                                                        //console.log("closed", err);
                                                                        complete(err);
                                                                });
                                                        }
                                              });
                                      }
                              
                              });
                              */

            } else {
                        //debug
                complete(e);
            }
        });
    }

              
    return (req, res, next) =>
    {
        let stream    = req;
        let complete = false;
        //let sync      = true;

        let received  = 0;
        let buffer    = null;

        let limit     = opt.limit; //10MB
        let length    = 0; 

            // attach listeners
        stream.on("aborted", onAborted);
        stream.on("close", cleanup);
        stream.on("data", onData);
        stream.on("end", onEnd);
        stream.on("error", onEnd);

        let cr = req.headers["content-range"];
        //let cont = true;

        let regexp = /bytes (\d+)-(\d+)\/(\d+)/gi;
        let start = 0;
        let end   = 0;
        let total = 0;
        let size = 0;
    
        function nodone(err)
        {
            if(err == null)
                res.end();
            else
              done(err);
        }       
              
        if(null != cr)
        {
            /*let m      =*/  cr.match(regexp);
            start = RegExp.$1;
            end   = RegExp.$2;
            total = RegExp.$3;

            size  = end - start;

                      //console.log("=======>", cr, regexp, m, start, end, total)

            buffer = Buffer.alloc(size);
        }

            //If you pass anything to the done() function (except the string 'route'), Express regards the current request as being in error and will skip any remaining non-error handling routing and middleware functions.


        function done(err)
        {
            cleanup();
            complete = true;

            if(err != null)
            {
                          ////console.log("next with error " + err.message);
                next(err);
            }
            else
            {
                          ////console.log("next OK");
                next();
            }


        }
          
        function onAborted () {
            if (complete) return;

            done(createError(400, "request aborted", "request.aborted", {
                code: "ECONNABORTED",
                expected: length,
                length: length,
                received: received
            }));
        }

        function onData (chunk) {
            if (complete) return;


            ////console.log("------- chunk buffer -> ", Buffer.isBuffer(chunk));

           
            //buffer.push(chunk);
            chunk.copy(buffer, received);
            received += chunk.length;

            if (limit !== null && received > limit) {
                done(createError(413, "request entity too large", "entity.too.large", {
                    limit: limit,
                    received: received
                }));
            }
        }

        function onEnd (err) {
            if (complete) return;
            if (err) return done(err);

            //if(false){
            if (size !== null && received !== size) {

                //console.log("---->Invalid Size", size, received, length);

                done(createError(400, "request size did not match content length", "request.size.invalid", {
                    expected: length,
                    length: length,
                    received: received
                }));
            } else {
              /*var string = decoder
                ? buffer + (decoder.end() || '')
                : Buffer.concat(buffer)
              done(null, string)
              */

                let path = opt.base_path;

              ////console.log(JSON.stringify(req.headers));

                if(null != req.headers.owner)
                {
                    path += req.headers.owner;
                    path += "/";
                }

                let filepath = path;

                if(null != req.headers["file-name"])
                    filepath +=  req.headers["file-name"];
             

               req['uploader'] = filepath; 


              //let cr = req.headers['content-range'];
              //let cont = true;
                if(null == cr)
                {
                 //console.log('NO HEADERS');
                    done(createError(400, "request has invalid headers", "request.size.invalid", {
                        expected: size,
                        length: buffer.length,
                        received: received
                    }));
                }
                      //let regexp = /bytes (\d+)-(\d+)\/(\d+)/gi;
                     // let m =  cr.match(regexp);
                      //let start = RegExp.$1;
                      //let end   = RegExp.$2;
                      //let total = RegExp.$3;

                      //let size  = end - start;

                      ////console.log("=======>", cr, regexp, m, start, end, total, received);

                if(size != received)
                {
                              //console.log('ERROR INVALID SIZE', size, buffer.length);
                    done(createError(400, "request content-size did not match content length", "request.size.invalid", {
                        expected: size,
                        length: buffer.length,
                        received: received
                    }));
                }

                      

                let fend = nodone;

                if(end == total)
                {

                                    //console.log("process end");
                    fend = done;
                }

                

                if(0 == start)
                {
                              //console.log("new file");

                    fs.stat(filepath, (err/*, stat*/) => {
                        if(err == null) {
                                        //'File exists'
                                        //console.log('removing', filepath);
                            fs.unlink(filepath, (err) => {
                                if(err != null)
                                    done(err);
                                else
                                            {
                                    append(path, filepath, buffer, fend, start);
                                }
                            });
                        } else if(err.code == "ENOENT") {
                                        // file does not exist
                            append(path, filepath, buffer, fend);
                        } else {
                            done(err);
                                           
                        }
                    });
                              
                }
                else
                      {
                              //console.log("process file");
                    append(path, filepath, buffer, fend, start);

                               
                }
            }

              
           
        }

        function cleanup () {
           // buffer = null

            stream.removeListener("aborted", onAborted);
            stream.removeListener("data", onData);
            stream.removeListener("end", onEnd);
            stream.removeListener("error", onEnd);
            stream.removeListener("close", cleanup);
        }
        
    };
}

