import http from 'http'
import https from 'https'
import * as Url from 'url'

function get_options(url)
{
   let parsed  = Url.parse(url);
   let opt = {
            hostname: parsed.hostname
          , port: parsed.port
          , path: parsed.path
          //, method: 'GET'
        };

   if(null == opt.port)
   {
        opt.port = ('https:' == parsed.protocol)?443:80;
   }

   let ret = {options : opt, worker : ('https:' == parsed.protocol)?https:http};

   return ret;
        
}

function request(options, worker, request_body = null)
{
        return new Promise( (resolve, reject) => {
            
            
            console.log("sending " + JSON.stringify(options));

            let res = worker.request(options, (request) => {
                
                let body = '';

                console.log("request!");

                request.on('data', (chunk) => {
                    
                    body += chunk;

                    console.log("data! [" + body.length + "] ");
                });
                
                request.on('end'  , () => 
                        {
                                console.log("end! [" + body.length + "]");
                                resolve( { request: request, body : body} );

                        }
                        );
                
                /*
                const statusCode = request.statusCode;
                const contentType = request.headers['content-type'];
   
                console.log(statusCode);

                  let error;
                  if (statusCode !== 200) {
                    error = new Error(`Request Failed.\n` +
                                      `Status Code: ${statusCode}`);
                  }
                  
                  if (error) {
                    console.log(error.message);
                    // consume response data to free up memory
                    request.resume();
                    
                    reject(error);

                  }
                 */
            });

            res.on('error', (err) => 
                            {
                                    console.log("error " + JSON.stringify(err));
                                    reject(err);
                            });
            
            if(null != request_body)
            {
                    res.write(request_body);
            }
            res.end();

        });
}

function handle_promise(prom, options, worker, request_body = null)
{
        return new Promise( (resolve, reject) => {

                console.log(JSON.stringify(options));
        
                prom.then(
                        (k) => {
                                let res = k.request;
                                console.log("then ok");
                                console.log("prom_filled " + res.statusCode);
                                if(
                                        (res.statusCode == 302 || res.statusCode == 301)
                                        && options.followredirect
                                  )
                                {
                                        console.log(JSON.stringify(res.headers));
                                       
                                        let url =  res.headers['location']
                                        
                                        console.log('redirect: ' + url);

                                        let opt =  get_options(url);

                                        Object.assign(options, opt.options);

                                        console.log("redirect " + url);

                                        request(options, opt.worker, request_body)
                                        .then(
                                              (k) => {
                                                      console.log("forward [" + k.body.length + "]");
                                                      resolve(k);
                                              }
                                            , (err) => {reject(err);}
                                        );
                                }
                                else
                                {
                                        let statusCode = res.statusCode;
                                        if(res.statusCode >= 200 && res.statusCode < 300)
                                        {
                                                resolve(res, body);
                                        }
                                        else
                                        {
                                                let error = new Error(`Request Failed.\n` +
                                                        `Status Code: ${statusCode}`);

                                                    error['body'] = body;
                                                    error['statusCode'] = statusCode;
                                                    error['headers'] = res.heders;

                                                    reject(error);

                                        }
                                }
                        }
                        , (err) => {reject(err);}
                        );
        
        });
}

function _req(url, r, method, request_body)
{
            //console.log(url);
            // Return a new promise.
            let opt = get_options(url);
                opt.options.method = method;

            let options = Object.assign(r._opt, opt.options);
            
            let prom = request(options
                            , opt.worker, request_body);

            console.log("-------"); 
            return  handle_promise(prom, options
                            , opt.worker, null);
}

export default class httprequest {
  
    constructor(options = null)
    {
            this._opt = { followredirect : true};
            
            if(null != options)
            {
                Object.assign(this._opt, options);
            }
 
    }
    
    get(url) {
        return _req(url, this, 'GET');    
    }

    put(url, body){
        return _req(url, this, 'PUT', body);
    }
}
