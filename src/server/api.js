var db = require('../db/db');
var spider = require('../spider/spider');
var logger = require('../logger');
var config = require('../config');
var essential = require('./json/essential-apps.json');
var licenses = require('./json/open-source-licenses.json');
var _ = require('lodash');
var moment = require('moment');
var cluster = require('cluster');
var async = require('async');
var elasticsearch = require('elasticsearch');

function miniPkg(pkg) {
  return {
    bayesian_average: pkg.bayesian_average,
    icon_hash: pkg.icon_hash,
    icon: config.server.host + '/api/icon/' + pkg.icon_hash + '/' + pkg.name + '.png',
    monthly_popularity: pkg.monthly_popularity,
    name: pkg.name,
    points: pkg.points,
    prices: pkg.prices,
    short_description: pkg.tagline,
    tagline: pkg.tagline,
    title: pkg.title,
    types: pkg.types,
  };
}

function counts(callback) {
  var results = {
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
      callback(err);
    }
    else {
      _.forEach(result, function(r) {
        results[r[0]] = r[1];
      });

      callback(null, results);
    }
  });
}

function essentials(mini, callback) {
  db.Package.find({name: {'$in': essential}}, function(err, pkgs) {
    if (err) {
      callback(err);
    }
    else {
      var new_pkgs = [];
      _.forEach(pkgs, function(pkg) {
        if (mini) {
          new_pkgs.push(miniPkg(pkg));
        }
        else {
          pkg.short_description = pkg.tagline;
          new_pkgs.push(pkg);
        }
      });

      callback(null, new_pkgs);
    }
  });
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

  app.get('/api/licenses', function(req, res) {
    success(res, licenses);
  });

  function appsFromMongo(findQuery, req, callback) {
    var regxp = null;

    findQuery.takedown = {'$ne': true};
    var countQuery = db.Package.count(findQuery);
    if (req.query.search) {
      if (req.query.search.indexOf('author:') === 0) {
        regxp = new RegExp(req.query.search.replace('author:', ''), 'i');
        countQuery.where({author: regxp});
      }
    }

    countQuery.exec(function(err, count) {
      if (err) {
        callback(err);
      }
      else {
        var query = db.Package.find(findQuery);
        if (req.query.limit) {
          query.limit(req.query.limit);
        }

        if (req.query.skip) {
          query.skip(req.query.skip);
        }

        if (req.query.search) {
          if (req.query.search.indexOf('author:') === 0) {
            regxp = new RegExp(req.query.search.replace('author:', ''), 'i');
            query.where({author: regxp});
          }
        }

        if (req.query.sort) {
          if (req.query.sort == 'relevance') {
            query.sort('-points');
          }
          else {
            query.sort(req.query.sort);
          }
        }

        query.exec(function(err, pkgs) {
          if (err) {
            callback(err);
          }
          else {
            if (req.query.mini == 'true') {
              var new_pkgs = [];
              _.forEach(pkgs, function(pkg) {
                new_pkgs.push(miniPkg(pkg));
              });

              pkgs = new_pkgs;
            }

            callback(null, {
              count: count,
              apps: pkgs,
            });
          }
        });
      }
    });
  }

  function appsFromElasticsearch(findQuery, req, callback) {
    var client = new elasticsearch.Client({host: config.elasticsearch.uri});

    var eQuery = {};
    if (findQuery) {
      eQuery.and = [];

      _.forEach(findQuery, function(value, name) {
        if (_.isObject(value) && value.$in) {
          var i = {};
          i[name] = value.$in;
          eQuery.and.push({in: i});
        }
        else {
          var terms = {};
          terms[name] = [value];
          eQuery.and.push({terms: terms});
        }
      });
    }

    var sort = '';
    var direction = 'asc';
    if (req.query.sort && req.query.sort != 'relevance') {
      if (req.query.sort.charAt(0) == '-') {
        direction = 'desc';
        sort = req.query.sort.substring(1);
      }
      else {
        sort = req.query.sort;
      }
    }

    if (sort == 'title') {
      sort = 'raw_title';
    }

    var body = {
      'from' : req.query.skip ? req.query.skip : 0,
      'size' : req.query.limit ? req.query.limit : 30,
      'query': {
        'multi_match': {
          'query': req.query.search.toLowerCase(),
          'fields': ['title^3', 'description^2', 'keywords^2', 'author', 'company'],
          'slop': 10,
          'max_expansions': 50,
          'type': 'phrase_prefix',
        }
      }
    };

    if (eQuery) {
      body.filter = eQuery;
    }

    if (sort) {
      var s = {};
      s[sort] = direction;
      body.sort = [s];
    }

    client.search({
      index: 'packages',
      type: 'package',
      body: body
    }, function (err, response) {
      if (err) {
        callback(err);
      }
      else {
        var pkgs = [];
        var count = response.hits.total;
        response.hits.hits.forEach(function(hit) {
          var pkg = hit._source;
          if (pkg.takedown) {
            count--;
          }
          else {
            if (req.query.mini == 'true') {
              pkgs.push(miniPkg(pkg));
            }
            else {
              pkgs.push(pkg);
            }
          }
        });

        callback(null, {
          count: response.hits.total,
          apps: pkgs,
        });
      }
    });
  }

  function apps(req, callback) {
    var findQuery = req.query.query ? JSON.parse(req.query.query) : {};
    if (!findQuery.types) {
      findQuery.types = {$in: [
        'webapp',
        'application',
        'scope'
      ]};
    }

    if (findQuery.license == 'Open Source') {
      findQuery.license = {$in: licenses};
    }

    if (req.query.search) {
      if (req.query.search.indexOf('author:') === 0) {
        appsFromMongo(findQuery, req, callback);
      }
      else {
        appsFromElasticsearch(findQuery, req, callback);
      }
    }
    else {
      appsFromMongo(findQuery, req, callback);
    }
  }

  //TODO cache this to speed up requests
  app.get('/api/apps', function(req, res) {
    apps(req, function(err, result) {
      if (err) {
        error(res, err);
      }
      else {
        success(res, result);
      }
    });
  });

  //TODO cache this
  app.get('/api/apps/essentials', function(req, res) {
    essentials((req.query.mini == 'true'), function(err, pkgs) {
      if (err) {
        error(res, err);
      }
      else {
        success(res, pkgs);
      }
    });
  });

  //TODO cache this
  app.get('/api/apps/counts', function(req, res) {
    counts(function(err, results) {
      if (err) {
        error(res, err);
      }
      else {
        success(res, results);
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
    db.Package.findOne({name: req.params.name, takedown: {'$ne': true}}).select('-reviews').exec(function(err, pkg) {
      if (err) {
        error(res, err);
      }
      else if (!pkg) {
        error(res, req.params.name + ' was not found', 404);
      }
      else {
        pkg.icon = config.server.host + '/api/icon/' + pkg.icon_hash + '/' + pkg.name + '.png';
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
            if (author_app_names.indexOf(p.name) == -1) {
              pkg.author_apps.push(miniPkg(p));
              author_app_names.push(p.name);
            }
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

  app.get('/api/info', function(req, res) {
    //TODO async call

    async.series([
      function(callback) {
        counts(function(err, results) {
          callback(err, 'counts', results);
        });
      },

      function(callback) {
        essentials(true, function(err, results) {
          callback(err, 'essentials', results);
        });
      },

      function(callback) {
        apps({query: {
          sort: '-points',
          limit: 6,
          search: null,
          mini: 'true',
        }}, function(err, results) {
          callback(err, 'top', results);
        });
      },

      function(callback) {
        apps({query: {
          sort: '-published_date',
          limit: 3,
          search: null,
          mini: 'true',
        }}, function(err, results) {
          callback(err, 'new', results);
        });
      },
    ], function(err, results) {
      if (err) {
        error(res, err);
      }
      else {
        var response = {};
        _.forEach(results, function(r) {
          if (r[0] == 'essentials') {
            response.essentials = {
              count: r[1].length,
              apps: r[1],
            };
          }
          else {
            response[r[0]] = r[1];
          }
        });

        success(res, response);
      }
    });
  });
}

exports.setup = setup;
