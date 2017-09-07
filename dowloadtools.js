#!/usr/bin/env

var fs       = require('fs');
var path     = require('path');
var proc     = require('process');

var npm      = require("npm");
var url      = require('url');
var cp       = require('child_process');


var dirname = path.join(__dirname, 'bin');
var dirup   = path.join(__dirname, 'uploader');

console.log("PLAT " , proc.platform, " ", proc.arch);

//console.log("BIN ", dirname);

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
    
    var myConfigObject = {}
    npm.load(myConfigObject, function (er) {
       if (er) 
            cb(er, null)
       else
        {            
            cb(null, npm.config.get('https-proxy'));
        }
    })
}

function geturl(who)
{
    if('win32' == proc.platform)
    {
        
        return 'https://s3.eu-central-1.amazonaws.com/mediagoom/' + proc.arch + '/' + who + '.exe';
        
    }
    else if('linux' == proc.platform && 'x64' == proc.arch)
    {
            if('mg' == who)
            {
                return "https://s3.eu-central-1.amazonaws.com/mediagoom/dev/out/Release/mg"
            }
            else
            {
                return 'https://s3.eu-central-1.amazonaws.com/mediagoom/linux/x64/' + who;
            }
    }

    return null;
    
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
        host: p.hostname,
        port: (p.port)?p.port:((p.protocol == 'https')?443:80),
        path: u.href,
            headers: {
                Host: u.host
            }
        };

        http = require(p.protocol.replace(":", ""));
    
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
        fs.unlink(dest);
        return cb(err.message);
    });

    file.on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result) 
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
        console.error("Could not download " + who +".exe ", er);
    }
    else
    {
        if(null == next)
            return;

        var mg     = geturl(next); 
        
        
        var file =  next + (('win32' == proc.platform)?'.exe':'');
        var dir  = path.join(dirname, file);
       
                    download(proxy, mg, dir
                        , function(e){
                            if('linux' == proc.platform)
                            {
                                cp.execSync('chmod 777 "' + dir + '"');
                            }
                            downloadcb(e, next, getnext(), proxy);
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
                if(!e || (e && e.code === "EEXIST")){
                    
                    get_proxy(function(er, proxy)
                        {
                            if(er)
                                console.error("cannot get proxy: " + er.toString());
                            else
                                filedownload(proxy);
                        });
                    
                }
                else
                {
                    console.error("cannot create bin dir: " + e.toString());
                }
    });
}
else
{
    console.error("This platform is not supported. [" + proc.platform + " / " + proc.arch + "]. Please report your problem or install tools manually");
}


fs.mkdir(dirup, (e) => {});