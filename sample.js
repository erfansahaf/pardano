const express = require('express');
const app = express();
const port = 8865;
const Pardano = require('./pardano');

var payment = new Pardano('API');

app.get('/pardano', function (req, res) {
    payment.sendRequest(100, 'http://domain.ir/pardano/verify', 1500, 'Description', function(err, link){
        if(err)
          res.end(err);
        else
          res.end("<html><body><a href='"+link+"'>Click to redirect.</a></body></html>");
    });

});
app.get('/pardano/verify', function(req, res){
    payment.verifyRequest(req, 100, function(success, message){
        if(success)
          res.end("Successfull");
        else
          res.end(message);
    });
});

app.listen(port, function () {
  console.log('Example app listening on port' + port);
});