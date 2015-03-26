var db = require('./db');
var config = require('./config');
var spider = require('./spider');
var utils = require('./utils');
var logger = require('./logger');
var feed = require('./feed');
var express = require('express');
var _ = require('lodash');
var compression = require('compression');
var moment = require('moment');
var prerender = require('prerender-node');
var fs = require('fs');
var mime = require('mime');
var moment = require('moment');
var sitemap = require('sitemap');
var cluster = require('cluster');
var async = require('async');

var app = express();

app.use(compression({
  threshold: 512,
  filter: function(req, res) {
    if (res.getHeader('content-type') == 'image/png') {
      return true;
    }

    return compression.filter(req, res);
  }
}));
app.use(prerender.whitelisted(['/app/.*', '/apps']));

if (config.use_app()) {
  app.use(express.static(__dirname + config.server.static));
}

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
  app.get('/api/health', function(req, res) {
    success(res, {
      id: cluster.worker.id
    });
  });

  if (config.use_icons()) {
    app.get('/api/icon/:name', function(req, res) {
      var name = req.params.name;
      if (name.indexOf('.png') == (name.length - 4)) {
        name = name.replace('.png', '');
      }

      db.Package.findOne({name: name}, function(err, pkg) {
        if (err) {
          error(res, err);
        }
        else if (!pkg) {
          res.status(404);
          fs.createReadStream(__dirname + config.server.static + '/img/404.png').pipe(res);
        }
        else {
          if (pkg.icon) {
            if (!pkg.icon_filename) {
              pkg.icon_filename = pkg.icon.replace('https://', '').replace('http://', '').replace(/\//g, '-');
            }

            var now = moment();
            var filename = config.data_dir + '/' + pkg.icon_filename;
            fs.exists(filename, function(exists) {
              if (exists && now.diff(pkg.icon_fetch_date, 'days') <= 2) {
                res.setHeader('Content-type', mime.lookup(filename));
                res.setHeader('Cache-Control', 'public, max-age=172800'); //2 days
                fs.createReadStream(filename).pipe(res);
              }
              else {
                utils.download(pkg.icon, filename, function(err) {
                  if (err) {
                    res.status(500);
                    fs.createReadStream(__dirname + config.server.static + '/img/404.png').pipe(res);
                  }
                  else {
                    pkg.icon_fetch_date = now.valueOf();

                    res.setHeader('Content-type', mime.lookup(filename));
                    res.setHeader('Cache-Control', 'public, max-age=172800'); //2 days
                    fs.createReadStream(filename).pipe(res);
                  }
                });
              }
            });
          }
          else {
            res.status(404);
            fs.createReadStream(__dirname + config.server.static + '/img/404.png').pipe(res);
          }
        }
      });
    });
  }

  app.get('/api/categories', function(req, res) {
    db.Department.find({}, function(err, deps) {
      if (err) {
        error(res, err);
      }
      else {
        deps = _.sortBy(deps, 'name');
        success(res, deps);
      }
    });
  });

  var frameworks = [];
  var frameworks_date = null;
  app.get('/api/frameworks', function(req, res) {
    var now = moment();
    if (!frameworks_date || now.diff(frameworks_date, 'hours') > 12 || frameworks.length === 0) { //Cache miss
      db.Package.find({}, 'framework', function(err, pkgs) {
        if (err) {
          error(res, err);
        }
        else {
          frameworks = [];
          _.forEach(pkgs, function(pkg) {
            _.forEach(pkg.framework, function(framework) {
              if (frameworks.indexOf(framework) == -1) {
                frameworks.push(framework);
              }
            });
          });

          frameworks = _.sortBy(frameworks);
          frameworks_date = moment();
          success(res, frameworks);
        }
      });
    }
    else { //Cache hit
      success(res, frameworks);
    }
  });

  //TODO cache this to speed up requests
  app.get('/api/apps', function(req, res) {
    var findQuery = req.query.query ? JSON.parse(req.query.query) : {};
    var query = null;
    var regxp = null;
    if (req.query.count == 'true') {
      query = db.Package.count(findQuery);

      if (req.query.search) {
        regxp = new RegExp(req.query.search, 'i');
        query.or([
          {author: regxp},
          {company: regxp},
          {title: regxp},
          {description: regxp},
          {keywords: regxp}
        ]);
      }

      query.exec(function(err, count) {
        if (err) {
          error(res, err);
        }
        else {
          success(res, count);
        }
      });
    }
    else {
      query = db.Package.find(findQuery);

      if (req.query.limit) {
        query.limit(req.query.limit);
      }

      if (req.query.skip) {
        query.skip(req.query.skip);
      }

      if (req.query.sort) {
        query.sort(req.query.sort);
      }

      if (req.query.search) {
        regxp = new RegExp(req.query.search, 'i');
        query.or([
          {author: regxp},
          {company: regxp},
          {title: regxp},
          {description: regxp},
          {keywords: regxp}
        ]);
      }

      query.exec(function(err, pkgs) {
        if (err) {
          error(res, err);
        }
        else {
          if (req.query.mini == 'true') {
            var new_pkgs = [];
            _.forEach(pkgs, function(pkg) {
              var description = pkg.description;
              if (pkg.description && pkg.description.split('\n').length > 0) {
                description = pkg.description.split('\n')[0];
              }

              new_pkgs.push({
                name: pkg.name,
                cloudinary_url: pkg.cloudinary_url,
                title: pkg.title,
                type: pkg.type,
                average_rating: pkg.average_rating,
                prices: pkg.prices,
                short_description: description,
                points: pkg.points,
              });
            });

            pkgs = new_pkgs;
          }

          success(res, pkgs);
        }
      });
    }
  });

  //TODO cache this and don't hardcode it
  app.get('/api/apps/popular', function(req, res) {
    var popular = [
      'steam.vagueentertainment',
      'soundtrap-app.vinzjobard',
      'com.zeptolab.cuttherope.full',
      'com.ubuntu.developer.mzanetti.machines-vs-machines',
      'com.ubuntu.developer.rpadovani.calculator',
      'com.ubuntu.telegram',
      'marvell.vtuson',
      'com.ubuntu.developer.rschroll.gmail',
    ];

    db.Package.find({name: {'$in': popular}}, function(err, pkgs) {
      if (err) {
        error(res, err);
      }
      else {
        var response = {
          games: [],
          apps: [],
          web_apps: [],
          scopes: []
        };

        _.forEach(pkgs, function(pkg) {
          if (['steam.vagueentertainment', 'soundtrap-app.vinzjobard'].indexOf(pkg.name) > -1) {
            response.web_apps.push(pkg);
          }
          else if (['com.zeptolab.cuttherope.full', 'com.ubuntu.developer.mzanetti.machines-vs-machines'].indexOf(pkg.name) > -1) {
            response.games.push(pkg);
          }
          else if (['com.ubuntu.developer.rpadovani.calculator', 'com.ubuntu.telegram'].indexOf(pkg.name) > -1) {
            response.apps.push(pkg);
          }
          else if (['marvell.vtuson', 'com.ubuntu.developer.rschroll.gmail'].indexOf(pkg.name) > -1) {
            response.scopes.push(pkg);
          }
        });

        success(res, response);
      }
    });
  });

  //TODO cache this
  app.get('/api/apps/counts', function(req, res) {
    var counts = {
      applications: 0,
      webapps: 0,
      scopes: 0,
      games: 0,
    };

    async.series([
      function(callback) {
        db.Package.count({type: 'application'}, function(err, count) {
          if (err) {
            callback(res);
          }
          else {
            callback(null, 'applications', count);
          }
        });
      },
      function(callback) {
        db.Package.count({type: 'webapp'}, function(err, count) {
          if (err) {
            callback(res);
          }
          else {
            callback(null, 'webapps', count);
          }
        });
      },
      function(callback) {
        db.Package.count({type: 'scope'}, function(err, count) {
          if (err) {
            callback(res);
          }
          else {
            callback(null, 'scopes', count);
          }
        });
      },
      function(callback) {
        db.Package.count({categories: 'games'}, function(err, count) {
          if (err) {
            callback(res);
          }
          else {
            callback(null, 'games', count);
          }
        });
      }
    ], function(err, result) {
      if (err) {
        error(res, err);
      }
      else {
        _.forEach(result, function(r) {
          counts[r[0]] = r[1];
        });

        success(res, counts);
      }
    });
  });

  app.get('/api/apps/:name', function(req, res) {
    db.Package.findOne({name: req.params.name}).select('-reviews').exec(function(err, pkg) {
      if (err) {
        error(res, err);
      }
      else if (!pkg) {
        error(res, req.params.name + ' was not found', 404);
      }
      else {
        pkg.reviews = undefined;
        success(res, pkg);
      }
    });
  });

  app.get('/api/apps/reviews/:name', function(req, res) {
    db.Review.findOne({name: req.params.name}).exec(function(err, rev) {
      if (err) {
        error(res, err);
      }
      else if (!rev) {
        error(res, req.params.name + ' was not found', 404);
      }
      else {
        var reviews = rev.reviews;
        var limit = reviews.length;
        var more = false;
        if (!_.isNaN(parseInt(req.query.limit))) {
          limit = parseInt(req.query.limit);
        }

        var skip = 0;
        if (!_.isNaN(parseInt(req.query.skip))) {
          skip = parseInt(req.query.skip);
        }

        more = ((skip + limit) < reviews.length);
        reviews = reviews.slice(skip, skip + limit);

        success(res, {
          reviews: reviews,
          name: rev.name,
          more: more
        });
      }
    });
  });

  app.get('/api/rss/new-apps.xml', function(req, res) {
    feed.generateFeed(function(err, f) {
      if (err) {
        error(res, err);
      }
      else {
        res.header('Content-Type', 'text/xml');
        res.send(f);
      }
    });
  });
}

if (config.use_app()) {
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

app.use(function(req, res) {
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
  app.listen(config.server.port, config.server.ip);
}

exports.run = run;
