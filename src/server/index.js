#!/usr/bin/env node
const modpath  = require('path');
const App      = require('./app');
const fs       = require('fs');
const dbg      = require('debug')('node-play:app');

function optval(name)
{
    if(null == process.env[name])
    {
        let ret = null;

        for(let j = arguments.length - 1; j > 0; j--)
        {
            if(arguments[j] != null)
            {
                ret = arguments[j];
            }
        }

        return ret;
    }

    return process.env[name];
}

function dir(d)
{
    try{
        fs.mkdirSync(d);
    }catch(err)
    {
        dbg('mkdir error %O', err);
    }
}

const home_destination = optval('NODEPLAYDESTINATION', process.env.HOME, process.env.APPDATA);
const status_man_use   = optval('NODEPLAYSTATUSMAN', '../processor/statmanfs.js');
const processor_use    = optval('NODEPLAYPROCESSOR', '../flows/processor.js');
const def_owner        = optval('NODEPLAYDEFOWNER', 'uploader');
const destination      = modpath.join(home_destination, '.node_play');

const port             = optval('NODEPLAYPORT', 3000);

let env_path = process.env.PATH;

const root_dir = modpath.normalize(modpath.join(__dirname, '../..'));
const dirname  = modpath.normalize(modpath.join(root_dir, './bin'));
const dist_dir = modpath.normalize(modpath.join(root_dir, './dist'));

process.env.PATH = dirname + modpath.delimiter + env_path;
process.env.OPFLOWDISKPATH = modpath.join(destination, 'storage');

dir(destination);
dir(process.env.OPFLOWDISKPATH);

const app = App({ status_man_use , processor_use, def_owner, root_dir, dist_dir, destination});


app.listen(port, function () {
    console.log('app listening on port ' + port + '!');
});



