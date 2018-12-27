const express   = require('express');
const uploader  = require('@mediagoom/chunk-upload');
const path      = require('path');
const dbg       = require('debug')('node-play:app');
const fs        = require('fs');


const default_config = {
    process_manager : '../processor/procman.js'
    , destination : path.normalize(path.join(__dirname, '../../opflow-dir'))
    , dist_dir : path.normalize(path.join(__dirname, '../../'))
};

function get_app(config){

    dbg('app config %O', config);

    config = Object.assign({}, default_config, config);

    const ProcMan = require(config.process_manager);

    const process_manager = new ProcMan(config);

    try{
        fs.mkdirSync(config.destination);
    }catch(err)
    {
        dbg('mkdir error %O', err);
    }

    express.static.mime.define({'application/dash+xml': ['mpd']});

    const app = express();

    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        next();
    });

    app.use('/play', express.static(config.destination));

    app.use('/upload', uploader({base_path: config.destination + '/'}));

    app.get('/clientaccesspolicy.xml', function (req, res) {
  
        let clientaccesspolicy = `<?xml version="1.0" encoding="utf-8" ?> 
<access-policy>
<cross-domain-access>
<policy>
<allow-from http-methods="*" http-request-headers="*">
<domain uri="http://*" /> 
</allow-from>
<grant-to>
<resource path="/" include-subpaths="true" /> 
</grant-to>
</policy>
</cross-domain-access>
</access-policy>
`;    
    
        res.send(clientaccesspolicy);
    });


    app.get('/api/list', (req, res, next) => {
    
        process_manager.list(config.def_owner).then(
        
            (list) => {res.json(list);}
            , (err) => { next(err);}
        
        );

    });

    app.get('/api/status/:id', (req, res, next) => {

        let id = req.params.id;

        process_manager.status(config.def_owner, id).then(
            (stat) => { res.json(stat);}
            , (err) => { next(err); }
        );

    });

    app.get('/api/upload/:name', (req, res, next) => {
  
        let name = req.params.name;

        process_manager.reserve_name(config.def_owner, name).then(
            id => res.json({id : id})
            , err => next(err)
        );

    });

    app.get('/api/queue/:id', (req, res, next) => {
  
        let id = req.params.id;

        process_manager.queue_operation_list(config.def_owner, id).then(
            ops => res.json(ops)
            , err => next(err)
        );

    });

    app.get('/api/queue/redo/:id/:operation_id', (req, res, next) => {
  
        let id = req.params.id;
        let operation_id = req.params.operation_id;

        process_manager.redo(config.def_owner, id, operation_id).then(
            () => res.send('OK')
            , err => next(err)
        );

    });

    app.get('/api/queue/status/:id', (req, res, next) => {
  
        let id = req.params.id;

        process_manager.queue_status(config.def_owner, id).then(
            ops => res.json(ops)
            , err => next(err)
        );

    });

    
    app.put('/upload/:id?', (req, res, next) => {
    
        dbg('queue headers %O', req.headers);
        dbg('queue file', req.uploader);
        

        let id = req.params.id;

        if(null != id)
        {
            process_manager.queue_job(config.def_owner
                , id 
                , req.uploader
            ).then(()=>{

                res.send('OK');

            }, err => 
            {
                console.error('QYE', err.message, err.stack); 
                process_manager.record_error(config.def_owner, id, err, 'QUEUE JOB ERROR');
                
                next(err);
            });
        }
   
    });

    app.use(express.static(config.dist_dir));
    
    app.use(function (err, req, res, next) {
            
        dbg(err.message, err.stack, next, res.status);

        const body = { msg : 'invalid operation'};

        if(undefined !== err.message)
            body.msg = err.message;

        if('no_production' !== process.env.NODE_ENV)
        {
            body.error = {message: err.message, stack: err.stack, status: res.status};
        }
        
        res.status(500).json(body);
    });
    
    return app;
}

module.exports = get_app;