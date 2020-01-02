const express = require('express');
const app = express();
var cors = require('cors');
var counter = 1; 
app.use(cors());

app.get('/', function (req, res) {
  var body = null;
  counter > 5 ? body = 'COMPLETE' : body = 'PENDING';
  res.send({status : body});

  console.log('\x1b[34m%s\x1b[0m','Request number: ' + counter);
  console.log('\x1b[34m%s\x1b[0m','Body: ' + body);
  console.log('\x1b[32m%s\x1b[0m','=====================================')
  body === 'COMPLETE' ? counter = 1 : counter++;
});
 
app.get('/request1/:id', function (req, res) {
  setTimeout(() => res.send({time: req.params.id}), req.params.id? req.params.id: 100);
});
 
app.get('/request2/:id', function (req, res) {
  setTimeout(() => res.send({time: req.params.id}),req.params.id? req.params.id: 100);
});
 
const port = 3000;
app.listen(port,()=>console.log('Server is running in the port '+port))
