
var express = require('express')
var app = express()

var port = 3000;

app.use(express.static('bin/client'));

/*
app.get('/', function (req, res) {
  res.send('Hello World!')
})
*/

app.listen(port, function () {
  console.log('app listening on port' + port + '!');
})



