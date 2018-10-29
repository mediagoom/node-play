const opflow = require('@mediagoom/opflow');
const dbg = require('debug')('node-play:opflow-processor');
const EventEmitter = require('events');
//const path = require('path');
const encode_flow = require('./encode').encode;

const flow_map = {};

function flow_end(flow_id)
{
    dbg('flow-end', flow_id);

    const obj_opflow_processor = flow_map[flow_id];
    
    if(undefined !== obj_opflow_processor)
    {
        delete flow_map[flow_id];      
        obj_opflow_processor.end();
       
    }
    else
    {
        dbg('missing flow-end', flow_id);
    }
}

opflow.on('end', flow_end);

const default_options = {

};



module.exports = class opflow_processor extends EventEmitter {

    constructor(name, opt) {
        
        super();
      
        if(null != opt)
            this.options = Object.assign(default_options, opt);
        else
            this.options = default_options;

        const already_running = !(opflow.start());

        dbg('started opflow ', already_running);

        this.flow_id = null;

        this.resolve = null;
        this.reject = null;
   
    }

    get id(){return this.options.id;}

    end()
    {
        dbg('flow-resolve', this.flow_id);

        if(null != this.resolve)
            this.resolve();

        this.resolve = true;
    }

    async read_stream_info(file_path){

        dbg('read_stream_info %s', file_path);

        this.flow_id = await opflow.add_flow(encode_flow);

        flow_map[this.flow_id] = this;

        //check we have not lost the event end 
        const ended = await opflow.is_flow_completed(this.flow_id);

        dbg('flow started', this.flow_id);

        if(ended)
            flow_end(this.flow_id);
       
        return { streams : { flow_id: this.flow_id } };
    }

    async encode(file_path, streams)
    {
        dbg('encode %s %O', file_path, streams);

        return streams;
    }

    async package(quality, sub_directory)
    {
        dbg('package %O %s', quality, sub_directory);

        return new Promise((resolve, reject) => {
            if(true === this.resolve)
            {
                resolve();
            }
            else
            {
                this.resolve = resolve;
                this.reject = reject;
            }
        });
    }

};
