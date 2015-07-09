var packageParser = require('./packageParser');
var config = require('../config');
var utils = require('../utils');
var db = require('../db/db');
var logger = require('../logger');
var _ = require('lodash');
var async = require('async');
var request = require('request');
var crypto = require('crypto');
var Mailhide = require('mailhide');
//var cloudinary = require('cloudinary');

var mailhider = null;
if (config.mailhide.privateKey && config.mailhide.publicKey) {
  mailhider = new Mailhide(config.mailhide);
}

var propertyMap = {
  architecture:   'architecture',
  author:         'developer_name',
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

      if (pkgProperty == 'filesize') {
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
      else if (pkgProperty == 'support' && pkg[pkgProperty].indexOf('mailto:') === 0 && mailhider) {
        pkg[pkgProperty] = mailhider.url(pkg[pkgProperty].replace('mailto:', ''));
      }
    }
  });

  pkg.icon_hash = crypto.createHash('md5').update(pkg.icon).digest('hex');

  if (pkg.type == 'application') {
    var desc = pkg.description.toLowerCase();
    if (desc.indexOf('webapp') > -1 || desc.indexOf('web app') > -1) {
      pkg.type = 'webapp';
    }

    var core = false;
    _.forEach(pkg.framework, function(framework) {
      if (framework.indexOf('ubuntu-core-') == 1) {
        core = true;
        return false;
      }
    });

    if (core) {
      pkg.type = 'snappy';
    }
  }

  if (pkg.types.length === 0) {
    pkg.types = [pkg.type];
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
            callback(null, pkg);
          });
        }
      });
    }
  });
}

function fetchListPage(page, packageList, callback) {
  request(config.spider.search_api + '?size=200&page=' + page, function(err, resp, body) {
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

        async.eachSeries(newList, packageParser.parseClickPackageByName, function(err) {
          if (err) {
            logger.error(err);
          }

          if (callback) {
            callback();
          }
        });
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

exports.parsePackage = parsePackage;
exports.parsePackages = parsePackages;
exports.parsePackageUpdates = parsePackageUpdates;
