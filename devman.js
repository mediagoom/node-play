#!/usr/bin/env

var chokidar = require('chokidar');
var cp       = require('child_process');
var express  = require('express');
var fs       = require('fs');

var config   = require('./devman.json');


const Reset = "\x1b[0m"


const FgBlack = "\x1b[30m"
const FgRed = "\x1b[31m"
const FgGreen = "\x1b[32m"
const FgYellow = "\x1b[33m"
const FgBlue = "\x1b[34m"
const FgMagenta = "\x1b[35m"
const FgCyan = "\x1b[36m"
const FgWhite = "\x1b[37m"

var action = "run";
var target = ".*";


if(process.argv.length > 2)
{
    console.log("argv", process.argv, process.argv.length);

    action = process.argv[2];

    if(process.argv.length > 3)
    {
        target = process.argv[3];
    }
}


var app = express();

var port = 2999;

app.use(express.static('../devman'));

app.get('/api', function (req, res) {
  
      res.json(g);
})

app.get('/restart/:idx/:debug?', (req, res) => {

        var idx = req.params.idx;
        console.log('restart ', idx);
        var ret = 'restarting';
        var debug = false;

        if(req.params.debug != null && req.params.debug == 'true')
        {
                debug = true;
                ret   = 'debug';
        }

        exec(idx, debug);

        res.send(ret);
});

app.get('/stop', (req, res) => {

    for(var i = 0; i < s.length; i++)
    {
        if(null != s[i].child)
            s[i].child.kill();
    }

    setTimeout(() => { process.exit();}, 1000);

    res.send("stopped");
    

});

var g = [];
var s = [];
// One-liner for current directory, ignores .dotfiles
//'.', {ignored: /(^|[\/\\])\../})


console.log(config.proc.length);

function clear_child(child)
{
        if(child == null)
                return null;

        child
}

function execnotexisting(idx, debug)
{  

   console.log(FgCyan, 'execnotexisting', g[idx].name, idx, Reset);

   var p = g[idx];

    if(g[idx]['status'] == 'executing')
    {

         console.log(FgMagenta, 'Process is executing ', g[idx].name, Reset);
         return;
    }

   g[idx]['status'] = 'executing';
   
   for(i = 0; i < p.exec.length; i++)
   {
        try{
           
                console.log(FgGreen, "executing: ", p.exec[i], Reset);
                var b = cp.execSync(p.exec[i], {timeout : p.timeout}).toString();
                    s[idx].exec_output[i] = b;

                console.log(b);

        }catch(err)
        {
            s[idx]['err'] = err;
            g[idx]['status'] = 'error';
            console.log(p.exec[i], ' error ', err.message);
            break;
        }
   }

   if(null != p.cmd && g[idx]['status'] != 'error')
   {
           s[idx].output = '';
           s[idx].outerr = '';

           console.log(FgGreen, 'spawing:', p.cmd.proc, p.cmd.args, debug, Reset);

           var args = p.cmd.args.slice();

           if(debug)
           {
                  for(var jj = (p.dbg_arg.length - 1); jj >= 0; jj--)
                  {
                          console.log(p.dbg_idx, p.dbg_arg[jj], args);
                          args.splice(p.dbg_idx, 0, p.dbg_arg[jj]);
                  }
                
               console.log(FgYellow, 
                               'spawing-debug:', p.cmd.proc, args
                               , Reset);
           }

           var opt = Object.assign({}, p.options);

           if(null != p.options.env
                   && null != opt.env)
           {
               opt.env = Object.assign(process.env, opt.env);

               //console.log("---env---",opt.env);
           }

           s[idx].child = cp.spawn(p.cmd.proc, args, opt);
           var k = idx;

           s[idx].child.on('close', (code, signal) => {
                g[k]['info']   = "close " + code;
                g[k]['status'] = "closed";
                g[k]['lastexitcode'] = code;

                var pid = null;
                
                if(s[k].child != null)
                   pid = s[k].child.pid;

                s[k].child = null;

                console.log(
                        (code == 0 || null == code)?FgGreen:FgRed,
                        'child end: ', pid, k, code, g[k]['status'], g[k].name
                        ,Reset);
           });

           s[idx].child.on('error', (err) => {
                g[k]['info']   = "err " + err.message;
                s[k]['err']    = err;
                g[k]['status'] = "error";
                s[k].child = null;

                console.log(FgRed, 'child error: ', g[k].name, k, err.message, opt);

           });

         s[idx].child.stdout.on('data', (data) => {
          //console.log(`stdout: ${data}`);
            s[k].output += data;
            console.log(data.toString());

            
        });

         s[idx].child.stderr.on('data', (data) => {
          //console.log(`stderr: ${data}`);
            s[k].outerr += data;
            console.log(FgRed, data.toString(), Reset);

            if(debug)
            {

                      var regexp = new RegExp(p.dbg_url, 'g');
                      var m =  s[k].outerr.match(regexp);
                      g[idx].debug = m;
                      if(null != m)
                      {
                        console.log('****************', m[0], '******************');
                      }
            }

        });

        g[k]['status'] = "running";
   }
   else
   {
        if(null != p.cmd)
           console.log(FgRed, '------>', g[idx].name, ' skip spawn on error', s[idx].exec_output);
        else
           g[idx]['status'] = "closed";
   }
}

function exec(idx, debug)
{
   //console.log(FgMagenta, idx, g, g[idx], Reset);

   if( g[idx]['status'] == 'closing'
     //|| g[idx]['status'] == 'closed'
     )
   {
         console.log(FgMagenta, 'Process is exiting ', idx, g[idx].status, g[idx].name, Reset);
         return;
   }

   g[idx]['status'] = 'closing';

   if(s[idx].child != null)
   {
        var pid = s[idx].child.pid;
        console.log(FgYellow, 'killing: ', pid, g[idx].name, Reset);
         var k = idx;
         s[idx].child.on('close', (code, signal) => {
                 
                 console.log(FgMagenta, 'kill close', pid, g[idx].name, g[idx].status, Reset);
                 
                 var j = k;
                 setTimeout(() => {execnotexisting(j, debug);}, 50);
         });

        s[idx].child.kill();
        s[idx].child = null;
   }
   else
   {
                 setTimeout(() => {execnotexisting(idx, debug);}, 50);
   }
}

function proc(next, idx)
{
  
    var p = g[idx];
   
   if(null != p.watch && 0 < p.watch.length)
   {
       console.log(FgGreen, idx, p.watch, Reset);

           var kidx = idx;
           chokidar.watch(p.watch).on('all', (event, path) => {
                   
                   console.log('watch ' + kidx, event, path);
                   if('change' == event)
                   {
                       if(s[idx].change)
                       {
                               console.log(FgYellow, "Discard Duplicated Change", kidx, g[kidx].name, Reset);
                               return;
                       }
                   
                        s[idx].change = true;
                            exec(kidx);

                        setTimeout(() => {s[kidx].change = false}, 5000);
                   }
                   //console.log(event, path);

                }); 
   }



  exec(idx);
  next();
}

function http_get(url, callback)
{
    
    require('http').get(url, (res) => {

        const statusCode = res.statusCode;

        if (statusCode !== 200) {
                error = new Error(`Request Failed.\n` +
                                  `Status Code: ${statusCode}`);
                callback(error);
                return;
        }

        res.setEncoding('utf8');
        var rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
                callback(null, rawData);
        });
   }).on('error', (e) => {
        callback(e); 
   });
}

function empty(){}

var next = empty

var patt = new RegExp(target);

if("run" === action)
{
    console.log("RUN", patt, config.proc.length);

    for(i = (config.proc.length - 1); i >= 0; i--)
    {
        console.log(i);

        var ff = next;
        var pp = config.proc[i];

         var d = {
              "name"  : "none"
            , "watch" : []
            , "exec"  : []
            , "cmd"   : null 
            , "debug" : false 
            , "break" : false
            , "index" : idx
            , "timeout" : 35000
            , "dbg_idx" : 0
            , "dbg_arg" : ['--inspect', '--debug-brk']
            , "dbg_url" : 'chrome-devtools:\/\/[^\\s\\n\\r]+'
         };

   var pp = Object.assign(d, pp);
   var dorun = patt.test(pp.name);
  
   console.log("]...------[...]------...[", JSON.stringify(pp), i, dorun);
   
   g[i] = pp;
   s[i] = {
           "exec_output" : []
                   , "change" : false
   };
        
        if(dorun)
        {
            console.log(FgGreen, "\t", pp.name, Reset);
            var mf  = ff;
            var idx = i;

            var nn = () => {proc(mf, idx);}

            next = nn;
        }

    }

    next();

    app.listen(port, function () {
        console.log('app listening on port ' + port + '!');
    })
}

function checkurl(timeout, url, count, max)
{
    setTimeout( () => {  
                
                http_get(url, function(err, body){
                
                    if(err)
                    {
                        console.log("cannot call ", url, count, max, err);

                        if(count < max)
                        {
                            checkurl(timeout, url, count + 1, max);
                        }

                    }
                    else
                    {
                        console.log("GOT", url);//, body);
                    }
                
                });
            }, timeout);
}

if("start" === action)
{
    console.log("START", target);

    const out = fs.openSync('./out.log', 'a');
    const err = fs.openSync('./out.log', 'a');
    
    var child = cp.spawn("node", [ process.argv[1], "run", target]
                , {
                    detached: true
                  , stdio: [ 'ignore', out, err ]
                  , cwd: process.cwd()
                });

    child.unref();

    var info = config[target];

    if(null != info)
    {
        if(null != info.url)
        {
            var timeout = 10000;

            if(null != info.timeout)
                timeout = info.timeout;
            
            checkurl(timeout, info.url, 0, 5);
            
        }

    }

    
                  
}

if("stop" === action)
{
    console.log("STOP", target);

   http_get('http://localhost:' + port + '/stop', function(err, body)
           {   if(err)
               {
                   console.log("error", err);
               }
               else
               {
                  console.log("exited", body);
               }
                                                       
           });

                  
}



        

