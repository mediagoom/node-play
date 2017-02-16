
var chokidar = require('chokidar');
var cp       = require('child_process');
var express  = require('express');

var config   = require('./devman.json');

var app = express()

var port = 2999;

app.use(express.static('./devman'));

app.get('/', function (req, res) {
  
      res.json(g);
})

app.get('/restart/:idx/:debug', (req, res) => {

        let idx = req.params.idx;
        console.log('restart ', idx);
        let ret = 'restarting';
        let debug = false;

        if(req.params.debug != null && req.params.debug == 'true')
        {
                debug = true;
                ret   = 'debug';
        }

        exec(idx, debug);

        res.send(ret);
})

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

   let p = g[idx];
   g[idx]['status'] = 'executing';
   
   for(i = 0; i < p.exec.length; i++)
   {
        try{
           
                console.log("executing: ", p.exec[i]);
                var b = cp.execSync(p.exec[i], {timeout : p.timeout}).toString();
                    g[idx].exec_output[i] = b;

                console.log(b);

        }catch(err)
        {
            g[idx]['err'] = err;
            g[idx]['status'] = 'error';
            console.log(p.exec[i], ' error ', err.message);
            break;
        }
   }

   if(null != p.cmd && g[idx]['status'] != 'error')
   {
           g[idx].output = '';
           g[idx].outerr = '';

           console.log('spawing:', p.cmd.proc, p.cmd.args);

           let args = p.cmd.args;

           if(debug)
           {
                  for(let jj = (p.dbg_arg.length - 1); jj >= 0; jj--)
                  {
                          console.log(p.dbg_idx, p.dbg_arg[jj], args);
                    args = args.splice(p.dbg_idx, 0, p.dbg_arg[jj]);
                  }
                
               console.log('spawing-debug:', p.cmd.proc, args);
           }



           s[idx].child = cp.spawn(p.cmd.proc, args);
           let k = idx;

           g[k]['status'] = "running";

           s[idx].child.on('close', (code, signal) => {
                g[k]['info']   = "close " + code;
                g[k]['status'] = "closed";
                s[k].child = null;

                if(0 != code)
                   g[k]['status'] = 'error';

                console.log('child end: ', k, code, g[k]['status']);
           });

           s[idx].child.on('error', (err) => {
                g[k]['info']   = "err " + err.message;
                g[k]['err']    = err;
                g[k]['status'] = "error";
                s[k].child = null;

                console.log('child error: ', k, err.message);


           });

         s[idx].child.stdout.on('data', (data) => {
          //console.log(`stdout: ${data}`);
            g[k].output += data;
            console.log(data.toString());

            if(debug)
            {

                      let regexp = p.dbg_url;
                      let m =  g[k].output.match(regexp);
                      if(null != m)
                      {
                        console.log('****************', m, '******************');
                      }
            }

        });

         s[idx].child.stderr.on('data', (data) => {
          //console.log(`stderr: ${data}`);
            g[k].outerr += data;
            console.log(data.toString());
        });
   }
   else
   {
           console.log('skip spawn on error', g[idx].exec_output);
   }

}

function exec(idx, debug)
{
   if(s[idx].child != null)
   {
        console.log('killing: ', g[idx].name);
         let k = idx;
         s[idx].child.on('close', (code, signal) => {
                 let j = k;
                 setTimeout(() => {execnotexisting(j);}, 50);
         });

        s[idx].child.kill();
        s[idx].child = null;
   }
   else
   {
           execnotexisting(idx, debug);
   }
}

function proc(p, next, idx)
{
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
            , "dbg_url" : /chrome-devtools:\/\/[\s\n\r]+/g
   };

   var p = Object.assign(d, p);

   console.log(JSON.stringify(p));

   console.log("-----------");
   
   p.exec_output = [];
   g[idx] = p;
   s[idx] = {};
  
   
   if(null != p.watch && 0 < p.watch.length)
   {
           let idx = p.index;
           chokidar.watch(p.watch).on('all', (event, path) => {
                   
                   console.log('watch ' + idx, event, path);
                   if('change' == event)
                       exec(idx);
                   //console.log(event, path);

                }); 
   }



  exec(idx);
  next();
}

function empty(){}

var next = empty

for(i = (config.proc.length - 1); i >= 0; i--)
{
    console.log(i);
    let ff = next;
    let pp = config.proc[i];
    let idx = i;
    let nn = () => {proc(pp, ff, idx);}

    next = nn;

}

next();

app.listen(port, function () {
  console.log('app listening on port ' + port + '!');
})

        

