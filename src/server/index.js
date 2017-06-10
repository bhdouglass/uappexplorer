var config = require('../config');
var logger = require('../logger');
var feed = require('./feed');
var icons = require('./icons');
var api = require('./api');
var snap = require('./snap');
var app = require('./app');
var auth = require('./auth');
var lists = require('./lists');
var express = require('express');
var compression = require('compression');
var fs = require('fs');
var bodyParser = require('body-parser');

var app_express = express();

app_express.use(compression({
  threshold: 512,
  filter: function(req, res) {
    if (res.getHeader('content-type') == 'image/png') {
      return true;
    }

    return compression.filter(req, res);
  }
}));
app_express.use(bodyParser.json());
app_express.use(bodyParser.urlencoded({extended: false}));

function success(res, data, message) {
  res.send({
    success: true,
    data: data,
    message: message ? message : null
  });
}

function error(res, message, code, noLog) {
  if (!noLog && code != 401 && code != 404) {
    logger.error('server: ' + message);
  }

  res.status(code ? code : 500);
  res.send({
    success: false,
    data: null,
    message: message
  });
}

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  }
  else {
    error(res, 'You must log in to access this', 401, true);
  }
}

if (config.use_app()) {
  app.setup(app_express, success, error, isAuthenticated);
  auth.setup(app_express, success, error, isAuthenticated);
}

if (config.use_api()) {
  api.setup(app_express, success, error, isAuthenticated);
  snap.setup(app_express, success, error, isAuthenticated);
  lists.setup(app_express, success, error, isAuthenticated);

  if (config.use_icons()) {
    icons.setup(app_express, success, error, isAuthenticated);
  }

  if (config.use_feed()) {
    feed.setup(app_express, success, error, isAuthenticated);
  }
}

app_express.use(function(req, res) {
  if (req.accepts('html')) {
    res.header('Content-Type', 'text/html');
    res.status(404);
    fs.createReadStream(__dirname + config.server.static + '/404.html').pipe(res);
  }
  else { //if (req.accepts('json')) {
    error(res, req.url + ' was not found', 404);
  }
});

function run() {
  logger.info('listening on ' + config.server.ip + ':' + config.server.port);
  app_express.listen(config.server.port, config.server.ip);
}

exports.run = run;
