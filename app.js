'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const path = require('path');
const http = require('http');
const routes = require('./routes');
const activity = require('./routes/activity');

// EXPRESS CONFIGURATION
const app = express();

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Express in Development Mode
if ('development' === app.get('env')) {
  app.use(errorhandler());
}


app.get('/', routes.index);
app.post('/login', routes.login);
app.post('/logout', routes.logout);

// Custom Routes for MC
app.post('/journeybuilder/save/', activity.save);
app.post('/journeybuilder/validate/', activity.validate);
app.post('/journeybuilder/publish/', activity.publish);
app.post('/journeybuilder/execute/', activity.execute);

// New route to get journeys
app.get('/journeys', activity.getJourneys);

http.createServer(app).listen(
  app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  }
);
