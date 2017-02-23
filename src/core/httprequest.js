import request from "request";

function blobToBuffer (blob, cb) {
    if (typeof Blob === "undefined" || !(blob instanceof Blob)) {
        throw new Error("first argument must be a Blob");
    }
    if (typeof cb !== "function") {
        throw new Error("second argument must be a function");
    }

    var reader = new FileReader();

    function onLoadEnd (e) {
        reader.removeEventListener("loadend", onLoadEnd, false);
        if (e.error) cb(e.error);
        else cb(null, new Buffer(reader.result));
    }

    reader.addEventListener("loadend", onLoadEnd, false);
    reader.readAsArrayBuffer(blob);
}


function _req(opts, resolve, reject)
{
    request(opts, (error, res, b) => {
        if(null != error){
                //console.log("httprequest error", error.message);
            reject(error);
        }
        else{
                //console.log("httprequest response" , res.statusCode);

            let statusCode = res.statusCode;
                
            if(res.statusCode >= 200 && res.statusCode < 300)
            {
                resolve( { response: res, body : b} );
            }
            else
            {
                let error = new Error("Request Failed.\n" +
                                `Status Code: ${statusCode}`);

                error["body"] = b;
                error["statusCode"] = statusCode;
                error["headers"] = res.heders;

                reject(error);

            }
                


        }
    });
}



function req(opts)
{
    return new Promise( (resolve, reject) => {


        let def = true;
        try{undefined === Blob;}catch(err){def = false;}

        if(!def || (!(opts.body instanceof Blob)) )
                            {
            _req(opts, resolve, reject);
        }
        else
                            {
            blobToBuffer(opts.body, (err, buffer) =>{
                if(null != err)
                    reject(err);
                else
                                     {
                    opts.body = buffer;
                    _req(opts, resolve, reject);
                }
            });
        }
        
            
    });
}

export default class httprequest {
  
    constructor(options = null)
    {
        this._opt = { };

        if(null != process)
        {
            if(null != process.env)
                if(null != process.env.http_proxy)
                    this._opt.proxy = process.env.http_proxy;
        }
            
        if(null != options)
            {
            Object.assign(this._opt, options);
        }
 
    }
    
    get(url) {

        this._opt.method = "GET";
        this._opt.uri    = url;

        return req(this._opt);
        
    }

    put(url, body){

        this._opt.method = "PUT";
        this._opt.uri    = url;

        this._opt.body   = body;

        return req(this._opt);
    }
}
