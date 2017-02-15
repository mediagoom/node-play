var config = require('./devman.json');
var chokidar = require('chokidar');
var cp = require('child_process');
var express = require('express');

var app = express()

var port = 2999;

app.use(express.static('./devman'));

app.get('/', function (req, res) {
  
      res.json(g);
})

app.get('/restart/:idx', (req, res) => {

        let idx = req.params.idx;
        console.log('restart ', idx);

        exec(idx);

        res.send('restarting');
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

function execnotexisting(idx)
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

           s[idx].child = cp.spawn(p.cmd.proc, p.cmd.args);
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

function exec(idx)
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
           execnotexisting(idx);
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
            , "timeout" : 15000
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

        

