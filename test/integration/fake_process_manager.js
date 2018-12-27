const dbg      = require('debug')('node-play:integration-test-api-fail');
//const unique_name = 'unique_name';
module.exports =  class fake_process_manager  {
    
    constructor(opt) {
        
        dbg('fake_process_manager', opt);

    }

    async reserve_name(owner, name)
    {
        
        dbg('reserve_name',owner, name);

        throw new Error('invalid reserve_name');

        //return unique_name;
    }

    async stop()
    {
        
    }

    async queue_job(owner, name, file, opt)
    {
        dbg('queue_job', owner, name, file, opt);
    }

    async list(owner, opt)
    {        
        dbg('list', owner, opt);
        throw new Error('invalid list');
        //return [unique_name];
    }

    async status(owner, id)
    {
        dbg('status', owner, id);
        throw new Error('invalid status');
        
    }

    async queue_status(owner, id)
    {
        
        dbg('queue status', owner, id);
        throw new Error('invalid queue_status');
        
    }

    async redo(owner, id, operation_id)
    {
        dbg('redo', owner, id, operation_id);
        //throw new Error('invalid redo');
    }

    async queue_operation_list(owner, id)
    {
        dbg('queue_operation_list', owner, id);
        throw new Error('invalid queue_operation_list');
    }

    record_error(owner, id, err, info)
    {
        dbg('record_error', owner, id, err, info);
        throw new Error('invalid record_error');
    }
};
