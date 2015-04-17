var db = require('../db');
var spider = require('../spider/spider');
var _ = require('lodash');
var fs = require('fs');
var moment = require('moment');
var cluster = require('cluster');
var async = require('async');
var path = require('path');

function miniPkg(pkg) {
  var description = pkg.description;
  if (pkg.description && pkg.description.split('\n').length > 0) {
    description = pkg.description.split('\n')[0];
  }

  return {
    name: pkg.name,
    cloudinary_url: pkg.cloudinary_url,
    title: pkg.title,
    types: pkg.types,
    bayesian_average: pkg.bayesian_average,
    prices: pkg.prices,
    short_description: description,
    points: pkg.points,
  };
}

function setup(app, success, error) {
  app.get('/api/health', function(req, res) {
    success(res, {
      id: cluster.worker.id
    });
  });

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
              new_pkgs.push(miniPkg(pkg));
            });

            pkgs = new_pkgs;
          }

          success(res, pkgs);
        }
      });
    }
  });

  //TODO cache this
  app.get('/api/apps/popular', function(req, res) {
    fs.readFile(path.join(__dirname, 'json/popular-apps.json'), function (err, data) {
      if (err) {
        error(res, err);
      }
      else {
        var popularNames = JSON.parse(data);

        var popular = [];
        _.forEach(popularNames, function(names) {
          popular = popular.concat(names);
        });

        db.Package.find({name: {'$in': popular}}, function(err, pkgs) {
          if (err) {
            error(res, err);
          }
          else {
            var response = {
              games: [],
              applications: [],
              webapps: [],
              scopes: []
            };

            _.forEach(pkgs, function(pkg) {
              if (popularNames.webapps.indexOf(pkg.name) > -1) {
                response.webapps.push(miniPkg(pkg));
              }
              else if (popularNames.games.indexOf(pkg.name) > -1) {
                response.games.push(miniPkg(pkg));
              }
              else if (popularNames.applications.indexOf(pkg.name) > -1) {
                response.applications.push(miniPkg(pkg));
              }
              else if (popularNames.scopes.indexOf(pkg.name) > -1) {
                response.scopes.push(miniPkg(pkg));
              }
            });

            success(res, response);
          }
        });
      }
    });
  });

  //TODO cache this
  app.get('/api/apps/essentials', function(req, res) {
    fs.readFile(path.join(__dirname, 'json/essential-apps.json'), function (err, data) {
      if (err) {
        error(res, err);
      }
      else {
        var names = JSON.parse(data);

        db.Package.find({name: {'$in': names}}, function(err, pkgs) {
          if (err) {
            error(res, err);
          }
          else {
            var new_pkgs = [];
            _.forEach(pkgs, function(pkg) {
              new_pkgs.push(miniPkg(pkg));
            });

            success(res, new_pkgs);
          }
        });
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

    function count(query, name) {
      return function(callback) {
        db.Package.count(query, function(err, count) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, name, count);
          }
        });
      };
    }

    async.series([
      count({types: {'$in': ['application']}}, 'applications'),
      count({types: {'$in': ['webapp']}}, 'webapps'),
      count({types: {'$in': ['scope']}}, 'scopes'),
      count({categories: 'games'}, 'games'),
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

  app.get('/api/apps/find/:name', function(req, res) {
    spider.parsePackage(req.params.name, function(err, pkg) {
      if (err) {
        error(res, err, 404);
      }
      else {
        success(res, pkg);
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
        error(res, 'No reviews found for ' + req.params.name, 404);
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
}

exports.setup = setup;
