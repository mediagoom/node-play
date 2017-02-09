import express from 'express'
import uploader from '../uploader/server.js'

var app = express()

var port = 3000;

app.use(express.static('../client'));
app.use('/upload', uploader);

/*
app.get('/', function (req, res) {
  res.send('Hello World!')
})
*/


app.put('/upload', (req, res) => {
    
       console.log(JSON.stringify(req.headers));

    
});

app.listen(port, function () {
  console.log('app listening on port ' + port + '!');
})



