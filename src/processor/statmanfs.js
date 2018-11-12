const assert = require('assert');//.strict;
const fs = require('fs');
const path = require('path');
const util   = require('util');
const dbg = require('debug')('node-play:statmanfs');

//const Stat = util.promisify(fs.stat);
const Mkdir = util.promisify(fs.mkdir);
//const ReadFile = util.promisify(fs.readFile);
//const WriteFile = util.promisify(fs.writeFile);
const ReadDir = util.promisify(fs.readdir);

function pad(num, size) {
    var s = '000000000000' + num;
    return s.substr(s.length-size);
}

const anchor = new Date(2100, 0, 0).getTime();

function new_id(name)
{
    let create = Date.now();
    let seconds = (anchor - create) / 1000;
    let n = pad(seconds.toFixed(0), 12);

    return n + '_' + name;
}

async function directory_exist_or_create(path) {
    //const stat = await Stat(path);
    try{
        await Mkdir(path, { recursive: true });
    }catch(err)
    {
        dbg('directory_exist_or_create error %O', err);
        if(err.code !== 'EEXIST')
            throw err;
    }
}



module.exports =  class StateManFs  {
    
    constructor(processor, opt) {
        //super();

        if(null == processor)
        {
            throw 'Invalid option.processor';
        }

        let defop = {
            destination : path.normalize(path.join(__dirname, '../..'))
        };
        
        if(null != opt)
            this.options = Object.assign(defop, opt);
        else
            this.options = defop;

        this.options.subdir = this.options.subdir || 'STATIC';
        this.options.statusfile = this.options.statusfile || 'status.json';

        this.processor = processor;

        this.processor_obj = null;
        
    }

    //PRIVATE

    get_processor(owner, name, id, out_opt)
    {
        assert(undefined !== name);

        const destination = path.join(this.options.destination, owner);
        let statman_target_dir = null; //path.join(destination, id);

        if(null !== this.processor_obj)
        {
            assert(undefined !== id);
            statman_target_dir = path.join(destination, id);

            return { processor : this.processor_obj
                , statman_target_dir
                , id
            };
        }
      
        this.processor_obj = new this.processor();
               
        if(undefined === id)
            id = new_id(name);       
        
        statman_target_dir = path.join(destination, id);

        return { processor : this.processor_obj
            , statman_target_dir
            , id
        };

    }

    update_status(fspath, status, fail_if_exist)
    {
        let flags = (fail_if_exist)?'wx+':'a+';

        return new Promise( (resolve, reject) => {
            fs.readFile(fspath, {flag: flags, encoding: 'utf8'}, (err, data) => {
                
                if(err && ( (err.code != 'ENOENT') || (!fail_if_exist)) )
                {
                    dbg('readFile error %O %s', err, err.stack);
                    reject(err);
                }
                else{

                    if(err || '' == data)
                    {                        
                        data = '{}';
                    }

                    let j = {};

                    try{ j = JSON.parse(data);}catch(e){dbg('JSON PARSE ERR:', e.code, '[', data, ']', flags, fspath, '----', e);}

                    if(null != status)
                    {
                        if(null != status.status)
                        {
                            if(null == j.previous)
                            {
                                j.previous = [];
                            }

                            if(null != j.status)
                                j.previous.push(j.status);
                        }

                        j = Object.assign(j, status);
                        j.datetime = new Date();
                        if(null == j.creationtime)
                        {
                            j.creationtime = new Date();
                        }

                        fs.writeFile(fspath, JSON.stringify(j), {flag: 'w+'}, (err) =>{
                    
                            if(err){
                                dbg('writeFile error %O %s', err, err.stack);
                                reject(err);
                            }
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
        return path.join(p['statman_target_dir'], this.options.statusfile);
    }

    /*
    async set_quick_status(p, status)
    {
        let stpath = this.status_path(p);
            
        let j = { status: status };

        return this.update_status(stpath, j, false);

        
    }

    async set_quick_processing(p, perc)
    {
        let stpath = this.status_path(p);
                       
        let j = { processing: perc };

        return this.update_status(stpath, j, false);
       
    }
    */

    //PUBLIC: ISTATEMAN

    async record_error(owner, id, err, info)
    {        

        let p = this.get_processor(owner, id, id);

        await this.update_status(this.status_path(p), {status: 'error', err : err.toString(), errinfo: (info + ' ['  +err.toString() + ']') }, false);

    }

    async reserve_name(owner, name)
    {
        let dir1 = this.options.destination;
        let dir2 = path.join(this.options.destination, owner);

        await directory_exist_or_create(dir1, { recursive: true });
        await directory_exist_or_create(dir2, { recursive: true });

        let p = this.get_processor(owner, name);
        
        await Mkdir(p['statman_target_dir'], { recursive: true });
        //TODO: move to opflow operations
        await Mkdir(path.join(p['statman_target_dir'], 'STATIC'), { recursive: true });

        let j = { status: 'reserved'
            , name : name
            , id : p.id
            , owner
        };

        await this.update_status( 
            this.status_path(p), j, true
        );

        return j.id;
    }

    async queue_job(owner, id, file, opt)
    {
        const p = this.get_processor(owner, id, id, opt);
               
        const queue_id = await p.processor.queue_process(file, id, p.statman_target_dir);
                                
        let res = {
            status   : 'queued'
            , queue_id
            
        };

        await this.update_status(this.status_path(p), res, false);

        return queue_id;
    }

    async list(owner, opt)
    {
        
        const procopt = Object.assign({}, this.options, opt);
        
        procopt.destination = path.join(procopt.destination, owner);

        const files = await ReadDir(procopt.destination);
           
        let j = [];
        
        for(let i = 0; i < files.length; i++)
        {
            let fstat = fs.statSync(path.join(procopt.destination, files[i]));
            
            if(fstat.isDirectory())
            {
                j.push({owner : owner, id : files[i]});
            }
        }

        return {assets: j};
        
    }

    async status(owner, id)
    {      

        let p = this.get_processor(owner, id, id);
            
        //we call update status passing null as the new status
        //in this way the current status is returned
        const j = await this.update_status(this.status_path(p), null, false);

        if('ok' != j.status)
        {
            dbg('ask processor for status %O', j);
            assert(j.queue_id, 'invalid queue_id', j.queue_id);
            j.status = await p.processor.get_status(j.queue_id);
        }

        return j;
    }


};

