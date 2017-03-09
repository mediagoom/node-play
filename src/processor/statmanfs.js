import fs from 'fs';
import path from 'path';



export default class StateManFs  {
    
    constructor(processor, opt) {
        //super();

        if(null == processor)
        {
            throw "Invalid option.processor";
        }

        let defop = {
            destination : './'
        };
        
        if(null != opt)
            this.options = Object.assign(defop, opt);
        else
            this.options = defop;

        this.options.subdir = this.options.subdir || 'STATIC';
        this.options.statusfile = this.options.statusfile || 'status.json';

        this.processor = processor;
        
    }

    update_status(fspath, status, fail_if_exist)
    {
        let flags = (fail_if_exist)?'wx+':'a+';

        return new Promise( (resolve, reject) => {
            fs.readFile(fspath, {flag: flags, encoding: 'utf8'}, (err, data) => {
                
                if(err && ( (err.code != 'ENOENT') || (!fail_if_exist)) ){reject(err);}
                else{

                    if(err)
                        data = '{}';

                    let j = {};

                    try{ j = JSON.parse(data);}catch(e){console.log("JSON PARSE ERR:", "[", data, "]", flags, fspath, '----', e);}

                    if(null != status)
                    {
                        j = Object.assign(j, status);

                        fs.writeFile(fspath, JSON.stringify(j), {flag: 'w+'}, (err) =>{
                    
                            if(err){reject(err);}
                            else{
                                resolve(j);
                            }
                    


                        });
                    }
                    else
                    {
                        resolve(j);
                    }

                }
            
            });
        });
    }

    status_path(p)
    {
        return path.join(p.get_target_dir(), this.options.statusfile);
    }

    reserve_name(owner, name)
    {
        
        return new Promise( (resolve, reject) => {

            let p = new this.processor(name, {destination: path.join(this.options.destination, owner)} );

                p.mkdirr(p.get_target_dir(), (err) => {
                    
                    if(err)
                    {
                        reject(err);
                    }
                    else
                    {

                        let j = { status: 'reserved'
                            , name : name
                            , id : p.id
                        }

                        this.update_status( 
                            this.status_path(p), j, true
                            ).then( (/*k*/) => {resolve(p.id);}
                                , (err)=> {reject(err);}
                                );
                    }
                });
        
        });
    }

    queue_job(owner, id, file, opt)
    {

        return new Promise( (resolve, reject) => {

            
            let procopt = Object.assign(this.options, opt);

            procopt.id = id;
            procopt.destination = path.join(procopt.destination, owner);

            let p = new this.processor(id, procopt);

            p.read_stream_info(file).then(
                    (st) => {
                        let s = p.get_streams(st);

                        p.encode(file, s).then(
                                    (quality) => {

                                        p.package(quality, procopt).then(
                                              ()=>{  
                                              
                                                  let res = {
                                                      status   : "ok"
                                                        , owner  : owner
                                                        , hls3   : "STATIC/main.m3u8"
                                                        , dash   : "STATIC/index.mpd"
                                                        , thumb  : ["img001.jpg", "img002.jpg"]
                                                        , hls4   : null
                                                        , playready : null
                                                        , widevine: null
                                                  };

                                                  this.update_status( 
                                                        this.status_path(p), res, false
                                                        ).then((/*k*/)=> {resolve();}
                                                            , (err)=> {reject(err);}
                                                            );
                                                                                  
                                              }
                                            , (err) => { reject(err);}
                                            );
                                    }, (err) => {reject(err);}
                                    );

                    }, (err)=> {reject(err);}
                    );

            resolve();
        
        });
    }

    list(owner, opt)
    {
        
        return new Promise( (resolve, reject) => {

            let procopt = Object.assign(this.options, opt);

            // procopt.id = id;
            procopt.destination = path.join(procopt.destination, owner);

            // let p = new this.processor('list', procopt);

            //let dir = p.get_target_dir();

            fs.readdir(procopt.destination, (err, files) =>
            {
                let j = [];

                if(err){
                    reject(err);
                }else
                {
                    for(let i = 0; i < files.length; i++)
                    {
                        j.push({owner : owner, id : files[i]});
                    }

                    resolve({assets: j});
                }
                
                
            });
        
           
        
        });
    }

    status(owner, id)
    {       

        return new Promise( (resolve, reject) => {
        
            let procopt = Object.assign(this.options, {id: id});
            procopt.destination = path.join(procopt.destination, owner);


            let p = new this.processor(id, procopt);

            this.update_status(this.status_path(p), null, false).then( j => resolve(j), err => reject(err));
        
        });
    }

    

}

