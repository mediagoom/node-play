

function es6req(objname)
{
    let o = require(objname);

    if(null == o.default)
        return o;

    return o.default;
}


export default class ProcMan  {
    
    constructor(opt) {
        //super();


        let defop = {

            processor : "./index.js"
            , statusman : "./statmanfs.js"
        };
        
        if(null != opt)
            this.options = Object.assign(defop, opt);
        else
            this.options = defop;


        let processor  = es6req(this.options.processor);
        this.statman   = es6req(this.options.statusman);

        let statopt    = Object.assign(this.options, {  });

        //console.log(statopt, this.processor, this.statman);

        this.state     = new this.statman(processor, statopt);

    }

    reserve_name(owner, name)
    {
        
        return this.state.reserve_name(owner, name);
    }

    queue_job(owner, name, file, opt)
    {
        return new Promise( (resolve, reject) => {

            this.state.queue_job(owner, name, file, opt).then( () => resolve()
                , (err) => {
                    this.state.record_error(owner, name, err).then( () => reject(err), (x) => reject(x) );
                }
            );

        });
           
    }

    list(owner, opt)
    {
        
        return this.state.list(owner, opt);
    }

    status(owner, id)
    {
        
        return this.state.status(owner, id);
        
    }



    

}
