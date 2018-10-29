const opflow = require('@mediagoom/opflow');
const dbg = require('debug')('node-play:opflow-processor');
const EventEmitter = require('events');
const path = require('path');

const default_options = {

};

module.exports = class opflow_processor extends EventEmitter {

    constructor(name, opt) {
        super();
      
        if(null != opt)
            this.options = Object.assign(default_options, opt);
        else
            this.options = default_options;
        

        this._anchor = new Date(2100, 0, 0).getTime();
        this._create = Date.now();
        this.name    = name;

    }

};
