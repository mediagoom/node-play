
module.exports =  class FakeStateMan  {
    
    constructor(processor, opt) {
        //super();

        if(null == processor)
        {
            throw 'Invalid option.processor';
        }

        let defop = {

        };
        
        if(null != opt)
            this.options = Object.assign(defop, opt);
        else
            this.options = defop;
        
        let procopt = Object.assign(this.options, {});

        /*let p =*/ new processor('TEST', procopt);
    }

    reserve_name(/*owner, name*/)
    {
        
        return new Promise( (resolve/*, reject*/) => {
        
            resolve('9999999999_TEST');
        
        });
    }

    queue_job(/*owner, name, file, opt*/)
    {
        return new Promise( (resolve/*, reject*/) => {
        
            resolve();
        
        });
    }

    list(owner/*, opt*/)
    {
        
        return new Promise( (resolve/*, reject*/) => {
        
            resolve(
                {
                    assets : [
                        {
                            owner : owner
                            , id : '9999999999_TEST'
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
                    , hls3   : 'STATIC/main.m3u8'
                    , dash   : 'STATIC/index.mpd'
                    , thumb  : ['img001.jpg', 'img002.jpg']
                    , 'previous': [
                        'reserved'
                        , 'analyzed'
                        , 'encoded'
                    ]
                    , hls4   : null
                    , playready : null
                    , widevine: null
                }
            );
        
        });
    }

    

};
