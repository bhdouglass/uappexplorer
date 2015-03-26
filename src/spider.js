var config = require('./config');
var utils = require('./utils');
var db = require('./db');
var logger = require('./logger');
var request = require('request');
var _ = require('lodash');
var async = require('async');
var schedule = require('node-schedule');
var express = require('express');
//var cloudinary = require('cloudinary');

var propertyMap = {
  architecture:   'architecture',
  author:         'developer_name',
  average_rating: 'ratings_average',
  categories:     'department',
  changelog:      'changelog',
  company:        'company_name',
  description:    'description',
  download:       'download_url',
  filesize:       'binary_filesize',
  framework:      'framework',
  icon:           'icon_url',
  icons:          'icon_urls',
  keywords:       'keywords',
  last_updated:   'last_updated',
  license:        'license',
  name:           'name',
  prices:         'prices',
  published_date: 'date_published',
  screenshot:     'screenshot_url',
  screenshots:    'screenshot_urls',
  status:         'status',
  support:        'support_url',
  terms:          'terms_of_service',
  title:          'title',
  type:           'content',
  version:        'version',
  videos:         'video_urls',
  website:        'website',
};

/*function cloudinaryUpload(pkg, data) {
  if (config.use_cloudinary()) {
    if (pkg.icon != data.icon_url || !pkg.cloudinary_url) {
      cloudinary.config(config.cloudinary);

      cloudinary.uploader.upload(
        data.icon_url,
        function(result) {
          logger.debug('got cloudinary url: ' + result.secure_url);
          if (result && result.secure_url) {
            pkg.cloudinary_url = result.secure_url;
            pkg.save(function(err) {
              if (err) {
                logger.error('error saving package: ' + err);
              }
            });
          }
        }, {
          public_id: pkg.name,
      });
    }
    else {
      logger.debug('not updating cloudinary url');
    }
  }
}*/

function map(pkg, data) {
  _.forEach(propertyMap, function(dataProperty, pkgProperty) {
    if (data[dataProperty] !== undefined) {
      pkg[pkgProperty] = data[dataProperty];

      if (dataProperty.indexOf('_url') > -1) {
        pkg[pkgProperty] = utils.fixUrl(pkg[pkgProperty]);
      }
      else if (pkgProperty == 'filesize') {
        pkg[pkgProperty] = utils.niceBytes(pkg[pkgProperty]);
      }
      else if (pkgProperty == 'description') {
        if (pkg[pkgProperty]) {
          var split = pkg[pkgProperty].replace('\r', '').split('\n');
          if (split.length == 2 && split[0] == split[1]) { //Remove duplicated second line
            pkg[pkgProperty] = split[0].replace('\n', '');
          }
        }
      }
    }
  });

  if (pkg.type == 'application') {
    var desc = pkg.description.toLowerCase();
    if (desc.indexOf('webapp') > -1 || desc.indexOf('web app') > -1) {
      pkg.type = 'webapp';
    }
  }

  return pkg;
}

function parsePackage(name, callback) {
  var url = config.spider.packages_api + name;
  logger.info('parsing ' + url);
  request(url, function(err, resp, body) {
    if (err) {
      logger.error('error requesting url: ' + err);
      callback(err);
    }
    else {
      var data = JSON.parse(body);
      db.Package.findOne({name: data.name}, function(err, pkg) {
        if (err) {
          logger.error('error finding package: ' + err);
          callback(err);
        }
        else {
          if (!pkg) {
            pkg = new db.Package();
          }

          pkg.name = name;
          //cloudinaryUpload(pkg, data);

          pkg = map(pkg, data);
          pkg.url = utils.fixUrl(data._links.self.href);
          pkg.icon_filename = pkg.icon.replace('https://', '').replace('http://', '').replace(/\//g, '-');

          pkg.save(function(err) {
            if (err) {
              logger.error('error saving package: ' + err);
              callback(err);
            }

            logger.info('saved ' + name);
            callback();
          });
        }
      });
    }
  });
}

function fetchListPage(page, packageList, callback) {
  request(config.spider.search_api + '?size=100&page=' + page, function(err, resp, body) {
    if (err) {
      logger.error('error fetching page #' + page + ': ' + err);
    }
    else {
      var data = JSON.parse(body);
      logger.debug('got package list page #' + page);
      if (data._embedded && data._embedded['clickindex:package']) {
        if (_.isArray(packageList)) {
          packageList = packageList.concat(data._embedded['clickindex:package']);
        }
        else {
          packageList = data._embedded['clickindex:package'];
        }

        fetchListPage(page + 1, packageList, callback);
      }
      else {
        callback(packageList);
      }
    }
  });
}

function fetchList(callback) {
  fetchListPage(1, [], callback);
}

function saveDepartment(d, callback) {
  logger.info('department: ' + d.name);
  db.Department.findOne({name: d.name}, function(err, dep) {
    if (err) {
      logger.error('error finding ' + d.name + ': ' + err);
      callback(err);
    }
    else if (!dep) {
      dep = new db.Department();
    }

    dep.name = d.name;
    dep.internal_name = d.slug;
    dep.url = utils.fixUrl(d._links.self.href);
    dep.save(function(err) {
      if (err) {
        logger.error('error saving department: ' + err);
        callback(err);
      }
      else {
        logger.info('saved ' + d.name);
        callback();
      }
    });
  });
}

function parseDepartments() {
  request(config.spider.departments_api, function(err, resp, body) {
    if (err) {
      logger.error('error fetching departments: ' + err);
    }
    else {
      var data = JSON.parse(body);
      if (data._embedded && data._embedded['clickindex:department']) {
        async.each(data._embedded['clickindex:department'], saveDepartment, function(err) {
          if (err) {
            logger.error(err);
          }
        });
      }
    }
  });
}

function parseReview(pkg, callback) {
  logger.info('parsing reviews for ' + pkg.name);
  request(config.spider.reviews_api + '?package_name=' + pkg.name, function(err, resp, body) {
    if (err) {
      callback(err);
    }
    else {
      var reviews = JSON.parse(body);

      db.Review.findOne({name: pkg.name}, function(err, rev) {
        if (err) {
          callback(err);
        }
        else {
          if (!rev) {
            rev = new db.Review();
          }

          rev.name = pkg.name;
          rev.reviews = reviews;

          var points = 0;
          _.forEach(reviews, function(review) {
            if (review.rating == 1) {
              points -= 1;
            }
            else if (review.rating == 2) {
              points -= 0.5;
            }
            else if (review.rating == 4) {
              points += 0.5;
            }
            else if (review.rating == 5) {
              points += 1;
            }
          });

          pkg.points = Math.round(points);

          async.series([
            function(cb) {
              rev.save(function(err) {
                if (err) {
                  cb(err);
                }
                else {
                  cb(null);
                }
              });
            },
            function(cb) {
              pkg.save(function(err) {
                if (err) {
                  cb(err);
                }
                else {
                  cb(null);
                }
              });
            }
          ], function(err) {
            if (err) {
              callback(err);
            }
            else {
              callback(null);
            }
          });
        }
      });
    }
  });
}

function parseReviews(callback) {
  db.Package.find({}, function(err, packages) {
    if (err) {
      logger.error(err);
    }
    else {
      async.eachSeries(packages, parseReview, function(err) {
        if (err) {
          logger.error(err);
        }

        if (callback) {
          callback();
        }
      });
    }
  });
}

function parsePackageUpdates(callback) {
  logger.info('parsing package updates');
  fetchList(function(list) {
    var newList = [];
    async.each(list, function(data, callback) {
      db.Package.findOne({name: data.name}, function(err, pkg) {
        if (err) {
          logger.error('error finding ' + data.name + ': ' + err);
          callback(err);
        }
        else if (!pkg || pkg.version != data.version) {
          newList.push(data.name);
          callback(null);
        }
        else {
          callback(null);
        }
      });
    }, function(err) {
      if (err) {
        logger.error(err);
      }

      logger.info('parsing ' + newList.length + '/' + list.length + ' updates');
      async.eachSeries(newList, parsePackage, function(err) {
        if (err) {
          logger.error(err);
        }

        if (callback) {
          callback();
        }
      });
    });
  });
}

function parsePackages(callback) {
  logger.info('parsing all packages');
  fetchList(function(list) {
    var newList = [];
    _.forEach(list, function(data) {
      newList.push(data.name);
    });

    //Remove mising packages
    db.Package.find({}, function(err, packages) { //TODO remove reviews too
      if (err) {
        logger.error(err);
      }
      else {
        _.forEach(packages, function(pkg) {
          if (newList.indexOf(pkg.name) == -1) {
            logger.info('deleting ' + pkg.name);
            pkg.remove(function(err) {
              if (err) {
                logger.error(err);
              }
            });
          }
        });
      }
    });

    async.eachSeries(newList, parsePackage, function(err) {
      if (err) {
        logger.error(err);
      }

      if (callback) {
        callback();
      }
    });
  });
}

function setupSchedule() {
  logger.debug('scheduling spider');
  var spider_rule = new schedule.RecurrenceRule();
  spider_rule.dayOfWeek = 1;
  spider_rule.hour = 0;
  spider_rule.minute = 0;

  schedule.scheduleJob(spider_rule, function() {
    parsePackages();
  });

  var spider_rule_updates = new schedule.RecurrenceRule();
  spider_rule_updates.dayOfWeek = new schedule.Range(0, 6, 1);
  spider_rule_updates.hour = new schedule.Range(0, 23, 2);
  spider_rule_updates.minute = 0;

  schedule.scheduleJob(spider_rule_updates, function() {
    parsePackageUpdates();
  });

  var department_rule = new schedule.RecurrenceRule();
  department_rule.dayOfWeek = 0;
  department_rule.hour = 0;
  department_rule.minute = 0;

  schedule.scheduleJob(department_rule, function() {
    logger.info('spider: running department spider');
    parseDepartments();
  });

  var reviews_rule = new schedule.RecurrenceRule();
  reviews_rule.dayOfWeek = new schedule.Range(0, 6, 1);
  reviews_rule.hour = 1;
  reviews_rule.minute = 0;

  schedule.scheduleJob(reviews_rule, function() {
    logger.info('spider: running review spider');
    parseReviews();
  });

  //one time scheduling
  var one_time = new Date(2015, 2, 26, 3, 10, 0);
  var now = new Date();
  if (one_time > now) {
    schedule.scheduleJob(one_time, function() {
      logger.info('spider: running spider (once)');
      //parsePackages();
      parseReviews();
    });
  }
}

function server() {
  var app = express();

  app.get('/', function(req, res) {
    res.send({
      success: true,
      data: {
        alive: true
      },
      message: null
    });
  });

  app.listen(config.server.port, config.server.ip);
}

exports.parsePackage = parsePackage;
exports.parsePackages = parsePackages;
exports.parsePackageUpdates = parsePackageUpdates;
exports.parseReviews = parseReviews;
exports.parseDepartments = parseDepartments;
exports.setupSchedule = setupSchedule;
exports.server = server;
