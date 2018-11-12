const assert = require('assert');//.strict;
const ID = '9999999999_TEST';

module.exports =  class FakeStateMan  {
    
    constructor(processor, opt) {
        //super();

        assert(undefined !== processor, 'Invalid option.processor');

        let default_option = {
            id : ID
            , error_test : false
        };
        
        assert(null != opt);
        this.options = Object.assign(default_option, opt);
        
    }

    async stop(){}

    async record_error(){}

    async reserve_name(/*owner, name*/)
    {
        if(this.options.error_test)
        {
            throw new Error('fake stateman testing error');
        }
        else
            return ID;
    }

    async queue_job(/*owner, name, file, opt*/)
    {
        if(this.options.error_test)
        {
            throw new Error('fake stateman testing error');
        }
        else
            return ID; 
    }

    list(owner/*, opt*/)
    {
        
        return new Promise( (resolve/*, reject*/) => {
        
            resolve(
                {
                    assets : [
                        {
                            owner : owner
                            , id : ID
                        }
                    ]
                }
            );
        
        });
    }

    status(owner, id)
    {
        
        return new Promise( (resolve/*, reject*/) => {
        
            resolve(
                {
                    status   : 'ok'
                    , name   : 'TEST'        
                    , id     : id
                    , owner  : owner
                    , datetime : null
                    , creationtime : null
                    , processing: null
                    , hls3   : 'STATIC/main.m3u8'
                    , dash   : 'STATIC/index.mpd'
                    , thumb  : ['img001.jpg', 'img002.jpg', 'img003.jpg', 'img004.jpg']
                    , previous: ['reserved']
                    , hls4   : null
                    , playready : null
                    , widevine: null
                }
            );
        
        });
    }

    

};
