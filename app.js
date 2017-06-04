var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

app.get('/', function(req,res) {
  res.send("Deployed");
});

app.get("/webhook", function(req, res) {
  if (req.query["hub.verify_token"] === "this_is_my_token");
  console.log("Verified webhook");
  res.status(200).send(req.query['hub.challenge']);
} else {
  console.error('Verificatoin failed');
  res.sendStatus(403);
});
