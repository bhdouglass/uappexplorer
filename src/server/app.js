'use strict';

var db = require('../db');
var config = require('../config');
var logger = require('../logger');
var express = require('express');
var _ = require('lodash');
var sitemap = require('sitemap');
var fs = require('fs');

//list borrowed from https://github.com/prerender/prerender-node
var useragents = [
  //'googlebot',
  //'yahoo',
  //'bingbot',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'developers.google.com/+/web/snippet',
  'slackbot',
  'vkShare',
  'W3C_Validator'
];

function setup(app) {
  app.use(express.static(__dirname + config.server.static));

  var sm = sitemap.createSitemap ({
    hostname: config.server.host,
    cacheTime: 1200000,  //2 hours
    urls: [
      {url: '/apps/',  changefreq: 'daily', priority: 1},
      {url: '/snaps/',  changefreq: 'daily', priority: 1},
    ]
  });

  app.get('/sitemap.xml', function(req, res) {
    db.Package.find({}, 'name', function(err, pkgs) {
      _.forEach(pkgs, function(pkg) {
        sm.add({url: '/app/' + pkg.name, changefreq: 'weekly', priority: 0.7});
      });

      db.Snap.find({}, ['name', 'store'], function(err, snaps) {
        snaps.forEach((snap) => {
          sm.add({url: '/snap/' + snap.store + '/' + snap.name, changefreq: 'monthly', priority: 0.7});
        });

        res.header('Content-Type', 'application/xml');
        res.send(sm.toString());
      });
    });
  });

  app.get('/app', function(req, res) {
    res.redirect(301, '/apps');
  });

  function openGraphData(html, og) {
    og = _.extend({
      title: 'uApp Explorer',
      description: 'Browse and discover apps for Ubuntu Touch',
      image: config.server.host + '/img/logo.png',
      url: config.server.host + '/apps',
    }, og);

    var og_html = '<meta name="description" content="' + og.description + '" />' +
      '<meta itemprop="name" content="' + og.title + '" />' +
      '<meta itemprop="description" content="' + og.description + '" />' +
      '<meta itemprop="image" content="' + og.image + '" />' +
      '<meta name="twitter:card" content="summary" />' +
      '<meta name="twitter:site" content="@uappexplorer" />' +
      '<meta name="twitter:title" content="' + og.title + '" />' +
      '<meta name="twitter:description" content="' + og.description + '" />' +
      '<meta name="twitter:image:src" content="' + og.image + '" />' +
      '<meta property="og:title" content="' + og.title + '" />' +
      '<meta property="og:type" content="website" />' +
      '<meta property="og:url" content="' + og.url + '" />' +
      '<meta property="og:image" content="' + og.image + '" />' +
      '<meta property="og:description" content="' + og.description + '" />' +
      '<meta property="og:site_name" content="uApp Explorer" />';

    return html.replace('<!-- Open Graph Data -->', og_html);
  }

  function isMatch(req) {
    var useragent = req.headers['user-agent'];
    var match = false;
    if (useragent) {
      match = useragents.some(function(ua) {
        return useragent.toLowerCase().indexOf(ua.toLowerCase()) !== -1;
      });
    }

    return (match || !_.isUndefined(req.query._escaped_fragment_));
  }

  app.get('/app/:name', function(req, res) { //For populating opengraph data, etc for bots that don't execute javascript (like twitter cards)
    res.header('Content-Type', 'text/html');
    db.Package.findOne({name: req.params.name}, function(err, pkg) {
      if (err) {
        logger.error('server: ' + err);
        res.status(500);
        res.send();
      }
      else if (!pkg) {
        //Check if a snap exists with this name so we can redirect to it
        db.Snap.findOne({name: req.params.name}, function(err, snap) {
          if (err) {
            logger.error('server: ' + err);
            res.status(500);
            res.send();
          }
          else if (snap) {
            res.redirect(301, `/snap/${snap.store}/${snap.name}`);
          }
          else {
            res.status(404);
            fs.createReadStream(__dirname + config.server.static + '/404.html').pipe(res);
          }
        });
      }
      else {
        if (isMatch(req)) {

          fs.readFile(__dirname + config.server.static + '/index.html', {encoding: 'utf8'}, function(err, data) {
            if (err) {
              res.status(500);
              res.send();
            }
            else {
              res.status(200);

              var og = {
                title: pkg.title,
                url: config.server.host + '/app/' + pkg.name,
                image: config.server.host + '/api/icon/' + pkg.icon_hash + '/' + pkg.name + '.png',
                description: pkg.tagline,
              };

              res.send(openGraphData(data, og));
            }
          });
        }
        else {
          res.sendFile('index.html', {root: __dirname + config.server.static});
        }
      }
    });
  });

  app.get('/snap/:store/:name', function(req, res) { //For populating opengraph data, etc for bots that don't execute javascript (like twitter cards)
    if (isMatch(req)) {
      res.header('Content-Type', 'text/html');
      db.Snap.findOne({name: req.params.name, store: req.params.store}, function(err, snap) {
        if (err) {
          logger.error('server: ' + err);
          res.status(500);
          res.send();
        }
        else if (!snap) {
          res.status(404);
          fs.createReadStream(__dirname + config.server.static + '/404.html').pipe(res);
        }
        else {
          fs.readFile(__dirname + config.server.static + '/index.html', {encoding: 'utf8'}, function(err, data) {
            if (err) {
              res.status(500);
              res.send();
            }
            else {
              res.status(200);

              let description = snap.tagline ? snap.tagline : snap.description;
              description = description ? description : '';

              let og = {
                title: snap.title,
                url: `${config.server.host}/snap/${snap.store}/${snap.name}`,
                image: `${config.server.host}/api/v1/snaps/icon/${snap.store}/${snap.icon_hash}/${snap.name}.png`,
                description: description,
              };

              res.send(openGraphData(data, og));
            }
          });
        }
      });
    }
    else {
      res.sendFile('index.html', {root: __dirname + config.server.static});
    }
  });

  app.get('/list/:id', function(req, res) { //For populating opengraph data, etc for bots that don't execute javascript (like twitter cards)
    if (isMatch(req)) {
      res.header('Content-Type', 'text/html');
      db.List.findOne({_id: req.params.id}, function(err, list) {
        if (err) {
          logger.error('server: ' + err);
          res.status(500);
          res.send();
        }
        else if (!list) {
          res.status(404);
          fs.createReadStream(__dirname + config.server.static + '/404.html').pipe(res);
        }
        else {
          fs.readFile(__dirname + config.server.static + '/index.html', {encoding: 'utf8'}, function(err, data) {
            if (err) {
              res.status(500);
              res.send();
            }
            else {
              res.status(200);

              var og = {
                title: 'User List - ' + list.name,
                url: config.server.host + '/list/' + list._id,
                description: 'User list by ' + list.user_name,
              };

              res.send(openGraphData(data, og));
            }
          });
        }
      });
    }
    else {
      res.sendFile('index.html', {root: __dirname + config.server.static});
    }
  });

  app.all(['/apps', '/apps/request', '/me', '/me/list/:id', '/faq', '/login', '/feeds', '/snaps'], function(req, res) { //For html5mode on frontend
    res.sendFile('index.html', {root: __dirname + config.server.static});
  });
}

exports.setup = setup;
