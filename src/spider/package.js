var takedowns = require('../server/json/takedowns.json');
var packageParser = require('./packageParser');
var config = require('../config');
var utils = require('../utils');
var db = require('../db/db');
var elasticsearchPackage = require('../db/elasticsearchPackage');
var logger = require('../logger');
var _ = require('lodash');
var async = require('async');
var request = require('request');
var crypto = require('crypto');
var Mailhide = require('mailhide');
var elasticsearch = require('elasticsearch');
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
  translations:   'translations',
  type:           'content',
  ubuntu_id:      'package_id',
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
  }
  else if (['oem', 'os', 'kernel', 'gadget', 'framework'].indexOf(pkg.type) >= 0) {
    pkg.type = 'snappy';
  }

  _.forEach(data.framework, function(framework) {
    if (framework.indexOf('ubuntu-core-') === 0) {
      pkg.type = 'snappy';

      return false;
    }
  });

  if (data.release && data.release.length) {
    _.forEach(data.release, function(release) {
      if (release == 'rolling-core') {
        pkg.type = 'snappy';

        return false;
      }
    });
  }

  if (pkg.types.length === 0 || pkg.type == 'snappy') {
    pkg.types = [pkg.type];
  }

  if (pkg.description && pkg.description.split('\n').length > 0) {
    var tagline = pkg.description.split('\n')[0];
    if (tagline == pkg.title) {
      tagline = '';

      if (pkg.description.split('\n').length > 1) {
        tagline = pkg.description.split('\n')[1];

        if (tagline.length > 50) {
          var pos = tagline.substring(0, 50).lastIndexOf(' ');
          if (pos > -1) {
            tagline = tagline.substring(0, pos) + '...';
          }
          else {
            tagline = tagline.substring(0, 50) + '...';
          }
        }
      }
    }

    pkg.tagline = tagline;
  }

  if (data.allow_unauthenticated && data.anon_download_url) {
    pkg.download = data.anon_download_url;
  }

  return pkg;
}

function mongoToElasticsearch(removals, callback) {
  var client = new elasticsearch.Client({host: config.elasticsearch.uri});

  client.indices.create({
    index: 'packages',
    body: {
      packages: 'packages',
      settings: {
        'analysis':{
          'analyzer': {
            'lower_standard': {
              'type': 'custom',
              'tokenizer': 'standard',
              'filter': 'lowercase'
            }
          }
        }
      },
      mappings: {
        'package': {
          'properties': {
            'title': {
              'type': 'string',
              'analyzer': 'lower_standard'
            },
            'description': {
              'type': 'string',
              'analyzer': 'lower_standard'
            },
            'keywords': {
              'type': 'string',
              'analyzer': 'lower_standard'
            },
            'author': {
              'type': 'string',
              'analyzer': 'lower_standard'
            },
            'company': {
              'type': 'string',
              'analyzer': 'lower_standard'
            },
            'license': {
              'type': 'string',
              'index': 'not_analyzed'
            },
            'framework': {
              'type': 'string',
              'index': 'not_analyzed'
            },
            'architecture': {
              'type': 'string',
              'index': 'not_analyzed'
            },
            'raw_title': {
              'type': 'string',
              'index': 'not_analyzed'
            }
          }
        }
      }
    }
  },
  function (err) {
    if (err) {
      logger.error(err);
    }

    db.Package.find({}, function(err, pkgs) {
      if (err) {
        logger.error(err);
      }
      else {
        elasticsearchPackage.bulk(pkgs, removals, callback);
      }
    });
  });
}

function callParsePackage(name, callback) {
  if (_.isArray(name)) {
    parsePackage(name[0], name[1], callback);
  }
  else {
    parsePackage(name, null, callback);
  }
}

function parsePackage(name, ubuntu_id, callback) { //TODO update all calling functions && test removals
  var url = config.spider.packages_api + name;
  if (ubuntu_id) {
    url = config.spider.packages_api + ubuntu_id;
  }

  logger.debug('parsing ' + url);

  if (!name || name == 'undefined') { //Sent a blank from the request app page
    callback('No package specified to parse');
  }
  else {
    request(url, function(err, resp, body) {
      if (err) {
        logger.error('error requesting url: ' + err);
        callback(err);
      }
      else {
        var data = JSON.parse(body);

        if (data.result == 'error') {
          callback('Package ' + name + ' does not exist in click store api');
        }
        else {
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

              if (takedowns.apps.indexOf(pkg.name) > -1) {
                pkg.takedown = true;
              }

              pkg.save(function(err) {
                if (err) {
                  logger.error('error saving package: ' + err);
                  callback(err);
                }

                logger.debug('saved ' + name);
                callback(null, pkg);
              });
            }
          });
        }
      }
    });
  }
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
    var nameList = [];
    var updateList = [];
    var nameMap = {};

    _.forEach(list, function(data) {
      nameList.push(data.name);
      nameMap[data.name] = data;
    });

    db.Package.find({}, function(err, packages) {
      if (err) {
        logger.error(err);
      }
      else {
        //Remove any missing apps
        removePackages(packages, nameList);

        var existingNames = [];
        //Update any packages with different versions
        _.forEach(packages, function(pkg) {
          existingNames.push(pkg.name);

          if (nameMap[pkg.name]) {
            if (pkg.version != nameMap[pkg.name].version) {
              if (nameMap[pkg.name].package_id) {
                updateList.push([pkg.name, nameMap[pkg.name].package_id]);
              }
              else {
                updateList.push(pkg.name);
              }

              logger.info('new version: ' + pkg.name + ' ' + pkg.version + ' > ' + nameMap[pkg.name].version);
            }
          }
        });

        //Pull in any new packages
        _.forEach(nameList, function(name) {
          if (existingNames.indexOf(name) == -1) {
            if (nameMap[name].package_id) {
              updateList.push([name, nameMap[name].package_id]);
            }
            else {
              updateList.push(name);
            }

            logger.info('new app: ' + name);
          }
        });

        logger.info('parsing ' + updateList.length + '/' + list.length + ' updates');
        async.each(updateList, callParsePackage, function(err) {
          if (err) {
            logger.error('Error parsing updates: ' + err);
          }

          async.eachSeries(updateList, packageParser.parseClickPackageByName, function(err) {
            if (err) {
              logger.error(err);
            }

            mongoToElasticsearch(null, callback);
          });
        });
      }
    });
  });
}

function removePackages(packages, list) {
  var removals = [];
  _.forEach(packages, function(pkg) {
    if (list.indexOf(pkg.name) == -1) {
      logger.info('deleting ' + pkg.name);

      removals.push(pkg);
      pkg.remove(function(err) {
        if (err) {
          logger.error(err);
        }
      });

      //Also remove from elasticsearch
      elasticsearchPackage.remove(pkg, function(err) {
        if (err) {
          logger.error(err);
        }
        else {
          logger.debug('deleted elasticsearch for ' + pkg.name);
        }
      });

      //Also remove review
      db.Review.findOne({name: pkg.name}, function(err, rev) {
        if (err) {
          logger.error(err);
        }
        else if (rev) {
          rev.remove(function(err) {
            if (err) {
              logger.error(err);
            }
            else {
              logger.debug('deleted reviews for ' + pkg.name);
            }
          });
        }
      });
    }
  });
}

function parsePackages(callback) {
  logger.info('parsing all packages');
  fetchList(function(list) {
    var removeCheckList = [];
    var updateList = [];
    _.forEach(list, function(data) {
      removeCheckList.push(data.name);

      if (data.package_id) {
        updateList.push([data.name, data.package_id]);
      }
      else {
        updateList.push(data.name);
      }
    });

    //Remove mising packages
    db.Package.find({}, function(err, packages) {
      if (err) {
        logger.error(err);
      }
      else {
        removePackages(packages, removeCheckList);

        async.eachSeries(updateList, callParsePackage, function(err) {
          if (err) {
            logger.error(err);
          }

          mongoToElasticsearch(removals, callback);
        });
      }
    });
  });
}

exports.parsePackage = parsePackage;
exports.parsePackages = parsePackages;
exports.parsePackageUpdates = parsePackageUpdates;
exports.mongoToElasticsearch = mongoToElasticsearch;
