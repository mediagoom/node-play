import express from "express";
import uploader from "../uploader/server.js";

var app = express();

var port = 3000;

app.use(express.static("bin/client"));

app.use("/upload", uploader());

/*
app.get('/', function (req, res) {
  res.send('Hello World!')
})
*/



app.put("/upload", (req, res) => {
    
    console.log("-------------****");
       //console.log(JSON.stringify(req.headers));
    console.log(req.uploader);
    console.log("-------------**--");

       

    res.send("OK");

    
});

app.listen(port, function () {
    console.log("app listening on port " + port + "!");
});



