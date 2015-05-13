var config = require('../config');
var logger = require('../logger');
var feed = require('./feed');
var icons = require('./icons');
var api = require('./api');
var app = require('./app');
var auth = require('./auth');
var express = require('express');
var compression = require('compression');
var fs = require('fs');

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

function success(res, data, message) {
  res.send({
    success: true,
    data: data,
    message: message ? message : null
  });
}

function error(res, message, code) {
  logger.error('server: ' + message);

  res.status(code ? code : 500);
  res.send({
    success: false,
    data: null,
    message: message
  });
}

if (config.use_api()) {
  api.setup(app_express, success, error);

  if (config.use_api()) {
    icons.setup(app_express, success, error);
  }

  if (config.use_feed()) {
    feed.setup(app_express, success, error);
  }
}

if (config.use_app()) {
  app.setup(app_express, success, error);
  auth.setup(app_express, success, error);
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
  app_express.listen(config.server.port, config.server.ip);
}

exports.run = run;
