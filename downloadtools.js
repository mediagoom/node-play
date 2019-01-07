#!/usr/bin/env node

var fs       = require('fs');
var path     = require('path');
var proc     = require('process');


var url      = require('url');
var cp       = require('child_process');


var dirname = path.join(__dirname, 'bin');
var dirup   = path.join(__dirname, 'uploader');

console.log('PLAT ' , proc.platform, ' ', proc.arch);

//console.log("BIN ", dirname);


function getPaths (bin) {
    var envPath = (process.env.PATH || '');
    var envExt = (process.env.PATHEXT || '');
    return envPath.replace(/["]+/g, '').split(path.delimiter).map(function (chunk) {
        return envExt.split(path.delimiter).map(function (ext) {
            return path.join(chunk, bin + ext);
        });
    }).reduce(function (a, b) {
        return a.concat(b);
    });
}

function fileExistsSync (filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (error) {
        return false;
    }
}

function inpath(bin)
{
    var pp = getPaths(bin);
    for(var i = 0; i < pp.length; i++)
    {
        if(fileExistsSync(pp[i]))
        {
            return pp[i];
        }
        
    }

    return null;
}



function get_proxy(cb)
{
    if(process.env.https_proxy)
    {
        cb(null, process.env.https_proxy);
        return;
    }

    if(process.env.http_proxy)
    {
        cb(null, process.env.http_proxy);
        return;
    }
    
    /*var myConfigObject = {};
    npm.load(myConfigObject, function (er) {
        if (er) 
            cb(er, null);
        else
        {            
            cb(null, npm.config.get('https-proxy'));
        }
    });*/

    var proxy_info = cp.execSync('npm config get https-proxy');

    var proxy = proxy_info.toString().replace(/\n/g, '');

    if(proxy.toLowerCase().startsWith('http'))
    {
        cb(null, proxy);
        return;
    }

    cb(null, null);
}

function geturl(who)
{
    var uri = 'https://defgroupdisks.blob.core.windows.net/builds/APPVEYOR';
    var end = '';
    
    if('win32' == proc.platform)
    {
        uri += '/Visual Studio 2017/master';
        end = '.exe';
    }
    else if('linux' == proc.platform && 'x64' == proc.arch)
    {
        uri += '/Ubuntu/master';
    }
    else
    {
        return null;
    }

    if('mg' == who)
    {
        uri += '/';
        uri += proc.arch;
    }

    return uri + '/' + who + end;

}

var download = function(proxy, address, dest, cb) {

    var u = url.parse(address);

    var http = require('https');

    var options = null;
    
    if(proxy)
    {
        var p = url.parse(proxy);

        //console.log(p);

        options = {
            host: p.hostname
            ,port: (p.port)?p.port:((p.protocol == 'https')?443:80)
            ,path: u.href
            ,headers: {
                Host: u.host
            }
        };

        http = require(p.protocol.replace(':', ''));
    
    }
    else
    {
        options = u.href;
    }

    //console.log("OPTIONS", options, ' [', dest, ']');

    var file = fs.createWriteStream(dest);
    var request = http.get(options, function(response) {

        // check if response is success
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }

        response.pipe(file);

        file.on('finish', function() {
            file.close(cb);  // close() is async, call cb after close completes.
        });
    });

    // check for request error too
    request.on('error', function (err) {
        fs.unlink(dest, function(){});
        return cb(err.message);
    });

    file.on('error', function(err) { // Handle errors
        fs.unlink(dest, function(){});// Delete the file async. (But we don't check the result) 
        return cb(err.message);
    });
};

var _jj = 0;

function getnext()
{
    var n = ['mg', 'ffmpeg', 'ffprobe'];

    if(_jj >= n.length)
        return null;

    return n[_jj++];
}

function downloadcb(er, who, next, proxy)
{
    if(null != er)
    {
        console.error('Could not download ' + who +'.exe ', er);
    }
    else
    {
        if(null == next)
            return;

        var mg     = geturl(next); 

        var exist = inpath(next);
        if(null != exist)
        {
            console.log('Found: ', next, ' in ', exist, ' using existing installation');
            downloadcb(null, null, getnext(), proxy);
            return;
        }        
        
        var file =  next + (('win32' == proc.platform)?'.exe':'');
        var dest  = path.join(dirname, file);
       
        console.log('download ', mg);
        download(proxy, mg, dest
            , function(e){
                if(null != e)
                {
                    console.error('cannot download', mg, e);
                }
                else
                {
                    if('linux' == proc.platform)
                    {
                        var cmd = 'chmod 777 "' + dest + '"';
                        //console.log(cmd);
                        try{

                            cp.execSync(cmd);

                        }catch(err)
                        {
                            console.error(err.message, err.stack);
                        }
                    }
                    downloadcb(e, next, getnext(), proxy);
                }
            }
        );
   
    }
}

function filedownload(proxy)
{
    downloadcb(null, null, getnext(), proxy);
}
//MAKE SURE WE KNOW WHERE TO GO
if(null != geturl('mg'))
{
    fs.mkdir(dirname, (e) => {
        
        if((null == e) || (e && e.code === 'EEXIST')){
         
            get_proxy(function(er, proxy)
            {
                if(er)
                    console.error('cannot get proxy: ' + er.toString());
                else
                    filedownload(proxy);
            });            
        }
        else
        {
            console.error('cannot create bin dir: ' + e.toString());
        }
    });
}
else
{
    console.error('This platform is not supported. [' + proc.platform + ' / ' + proc.arch + ']. Please report your problem or install tools manually');
}


fs.mkdir(dirup, () => {});