import express from "express";
import uploader from "../uploader/server.js";
import ProcMan  from "../processor/procman.js";
import modpath from "path";

function optval(name, def)
{
    if(null == process.env[name])
    {
        return def;
    }

    return process.env[name];
}


let status_man_use = optval("NODEPLAYSTATUSMAN", "../processor/statmanfs.js");
let processor_use  = optval("NODEPLAYPROCESSOR", "../processor/index.js");
let def_owner      = optval("NODEPLAYDEFOWNER", "uploader");

let port           = optval("NODEPLAYPORT", 3000);

let statusman = new ProcMan({statusman : status_man_use,  processor : processor_use});

express.static.mime.define({"application/dash+xml": ["mpd"]});

let app = express();

let env_path = process.env.PATH;

let dirname = modpath.normalize(modpath.join(__dirname, "../../bin"));

process.env.PATH = dirname + modpath.delimiter + env_path;

console.log("PATH: ", dirname, " ", env_path);
console.log("---------------------");
console.log(process.env.PATH);
console.log("---------------------");



app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.use("/play", express.static("./"));

app.use("/upload", uploader());

app.get("/clientaccesspolicy.xml", function (req, res) {
  
    let clientaccesspolicy = `<?xml version="1.0" encoding="utf-8" ?> 
<access-policy>
<cross-domain-access>
<policy>
<allow-from http-methods="*" http-request-headers="*">
<domain uri="http://*" /> 
</allow-from>
<grant-to>
<resource path="/" include-subpaths="true" /> 
</grant-to>
</policy>
</cross-domain-access>
</access-policy>
`;    
    
    res.send(clientaccesspolicy);
});


app.get("/api/list", (req, res, next) => {
    
    statusman.list(def_owner).then(
        
        (list) => {res.json(list);}
        , (err) => { next(err);}
        
        );

});

app.get("/api/status/:id", (req, res, next) => {

    let id = req.params.id;

    statusman.status(def_owner, id).then(
        (stat) => { res.json(stat);}
        , (err) => { next(err); }
        );

});

app.get("/api/upload/:name", (req, res, next) => {
  
    let name = req.params.name;

    statusman.reserve_name(def_owner, name).then(
        id => res.json({id : id})
        , err => next(err)
    );

});

app.put("/upload/:id?", (req, res) => {
    
    console.log("-------------****");
       //console.log(JSON.stringify(req.headers));
    console.log(req.uploader);
    console.log("-------------**--");

    let id = req.params.id;

    if(null != id)
    {

        statusman.queue_job(def_owner
            , id //, path.basename(req.uploader)
            , req.uploader
            ).then(()=>{}, err => console.log("MUST RECORD QUEUE JOB ERROR", err));
    }

    res.send("OK");

    
});



app.use(express.static("dist"));

app.listen(port, function () {
    console.log("app listening on port " + port + "!");
});



