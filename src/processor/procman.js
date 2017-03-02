

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


        this.processor = es6req(this.options.processor);
        this.statman   = es6req(this.options.statusman);

        

        let statopt    = Object.assign(this.options, {  });

        //console.log(statopt, this.processor, this.statman);

        this.state     = new this.statman(this.processor, statopt);
        

    }

    reserve_name(owner, name)
    {
        
        return this.state.reserve_name(owner, name);
    }

    queue_job(owner, name, file, opt)
    {
        return this.state.queue_job(owner, name, file, opt);
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
