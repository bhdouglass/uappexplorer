var db = require('../db');
var spider = require('../spider/spider');
var logger = require('../logger');
var essential = require('./json/essential-apps.json');
var _ = require('lodash');
var moment = require('moment');
var cluster = require('cluster');
var async = require('async');

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
    if (!findQuery.types) {
      findQuery.types = {'$in': [
        'webapp',
        'application',
        'scope'
      ]};
    }

    var query = null;
    var regxp = null;
    if (req.query.count == 'true') {
      query = db.Package.count(findQuery);

      if (req.query.search) {
        if (req.query.search.indexOf('author:') === 0) {
          regxp = new RegExp(req.query.search.replace('author:', ''), 'i');
          query.where({author: regxp});
        }
        else {
          regxp = new RegExp(req.query.search, 'i');
          query.or([
            {author: regxp},
            {company: regxp},
            {title: regxp},
            {description: regxp},
            {keywords: regxp}
          ]);
        }
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
        if (req.query.search.indexOf('author:') === 0) {
          regxp = new RegExp(req.query.search.replace('author:', ''), 'i');
          query.where({author: regxp});
        }
        else {
          regxp = new RegExp(req.query.search, 'i');
          query.or([
            {author: regxp},
            {company: regxp},
            {title: regxp},
            {description: regxp},
            {keywords: regxp}
          ]);
        }
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
  app.get('/api/apps/essentials', function(req, res) {
    db.Package.find({name: {'$in': essential}}, function(err, pkgs) {
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

        //TODO cache this
        db.Package.find({author: pkg.author, name: {$ne: pkg.name}}).sort('-points').limit(3).exec(function(err, pkgs) {
          if (err) {
            logger.error('server: ' + err);
            pkgs = [];
          }

          pkg = JSON.parse(JSON.stringify(pkg));
          pkg.author_apps = [];
          pkg.related_apps = [];

          var author_app_names = [pkg.name];
          _.forEach(pkgs, function(p) {
            pkg.author_apps.push(miniPkg(p));
            author_app_names.push(p.name);
          });

          if (pkg.keywords.length > 0) {
            //TODO cache this
            db.Package.aggregate([
              {$match: {
                keywords: {$in: pkg.keywords},
                name: {$nin: author_app_names},
                categories: {$in: pkg.categories},
              }},
              {$unwind: '$keywords'},
              {$match: {keywords: {$in: pkg.keywords}}},
              {$group: {
                _id: '$_id',
                like_keywords: {$sum: 1},
                pkgs: {$addToSet: '$$ROOT'}}
              },
              {$sort: {like_keywords: -1, 'pkgs.points': -1}},
              {$limit: 3}
            ], function(err, data) {
              if (err) {
                logger.error('server: ' + err);
                data = [];
              }

              _.forEach(data, function(item) {
                if (item.pkgs.length > 0) {
                  pkg.related_apps.push(miniPkg(item.pkgs[0]));
                }
              });

              success(res, pkg);
            });
          }
          else {
            success(res, pkg);
          }
        });
      }
    });
  });

  app.get('/api/apps/reviews/:name', function(req, res) {
    db.Review.findOne({name: req.params.name}).exec(function(err, rev) {
      if (err) {
        error(res, err);
      }
      else if (!rev) {
        success(res, {
          reviews: [],
          name: req.params.name,
          more: false,
          stats: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
            total: 0,
          }
        });
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
          more: more,
          stats: rev.stats,
        });
      }
    });
  });
}

exports.setup = setup;
