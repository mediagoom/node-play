import express from "express";
import uploader from "../uploader/server.js";
import ProcMan  from "../processor/procman.js";
//import path from "path";

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



let statusman = new ProcMan({statusman : status_man_use,  processor : processor_use});


express.static.mime.define({'application/dash+xml': ['mpd']});

var app = express();

var port = 3000;

//app.use(express.static("bin/client"));

app.use("/play", express.static("./"));

app.use("/upload", uploader());

/*
app.get('/', function (req, res) {
  res.send('Hello World!')
})
*/

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

app.listen(port, function () {
    console.log("app listening on port " + port + "!");
});



