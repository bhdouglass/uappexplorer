var db = require('../db');
var config = require('../config');
var express = require('express');
var _ = require('lodash');
var prerender = require('prerender-node');
var sitemap = require('sitemap');

function setup(app) {
  app.use(prerender.whitelisted(['/app/.*', '/apps']));
  app.use(express.static(__dirname + config.server.static));

  var sm = sitemap.createSitemap ({
    hostname: config.server.host,
    cacheTime: 1200000,  //2 hours
    urls: [
      {url: '/apps/',  changefreq: 'daily', priority: 1},
    ]
  });

  app.get('/sitemap.xml', function(req, res) {
    db.Package.find({}, 'name', function(err, pkgs) {
      _.forEach(pkgs, function(pkg) {
        sm.add({url: '/app/' + pkg.name, changefreq: 'weekly', priority: 0.7});
      });

      res.header('Content-Type', 'application/xml');
      res.send(sm.toString());
    });
  });

  app.get(['/app'], function(req, res) {
    res.redirect(301, '/apps');
  });

  app.all(['/apps', '/app/:name'], function(req, res) { //For html5mode on frontend
    res.sendFile('index.html', {root: __dirname + config.server.static});
  });
}

exports.setup = setup;
