'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var bodyParser  = require('body-parser');
var errorhandler = require('errorhandler');
var http        = require('http');
var path        = require('path');

// EXPRESS CONFIGURATION
var app = express();

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


http.createServer(app).listen(
  app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  }
);
