var config = require('../config');
var logger = require('../logger');
var db = require('../db/db');
var elasticsearchPackage = require('../db/elasticsearchPackage');
var utils = require('../utils');
var takedowns = require('../server/json/takedowns.json');
var packageParser = require('./packageParser');

var request = require('request');
var async = require('async');
var crypto = require('crypto');
var Mailhide = require('mailhide');
var elasticsearch = require('elasticsearch');
var sanitizeHtml = require('sanitize-html');

var mailhider = null;
if (config.mailhide.privateKey && config.mailhide.publicKey) {
  mailhider = new Mailhide(config.mailhide);
}

//ubuntu package: internal package or transform function
var propertyMap = {
  architecture: 'architecture',
  developer_name: 'author',
  department: 'categories',
  company_name: 'company',
  changelog: function(pkg, changelog) {
    pkg.changelog = sanitizeHtml(changelog, {
      allowedTags: [],
      allowedAttributes: [],
    });
  },
  description: function(pkg, description) {
    description = sanitizeHtml(description, {
      allowedTags: [],
      allowedAttributes: [],
    });

    var split = description.replace('\r', '').split('\n');
    if (split.length == 2 && split[0] == split[1]) { //Remove duplicated second line
      pkg.description = split[0].replace('\n', '');
    }
    else {
      pkg.description = description;
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
    else {
      pkg.tagline = '';
    }
  },
  download_url: function (pkg, download_url) {
    pkg.download = utils.fixUrl(download_url);
  },
  binary_filesize: function(pkg, binary_filesize) {
    pkg.filesize = utils.niceBytes(binary_filesize);
  },
  framework: 'framework',
  icon_url: function (pkg, icon) {
    pkg.icon = utils.fixUrl(icon);
    pkg.icon_hash = crypto.createHash('md5').update(pkg.icon).digest('hex');
    pkg.icon_filename = pkg.icon.replace('https://', '').replace('http://', '').replace(/\//g, '-');
  },
  keywords: 'keywords',
  last_updated: 'last_updated',
  license: 'license',
  name: 'name',
  prices: 'prices',
  date_published: 'published_date',
  screenshot_url: function (pkg, screenshot_url) {
    pkg.screenshot = utils.fixUrl(screenshot_url);
  },
  screenshot_urls: function (pkg, screenshot_urls) {
    pkg.screenshots = [];
    screenshot_urls.forEach(function(screenshot) {
      pkg.screenshots.push(utils.fixUrl(screenshot));
    });
  },
  status: 'status',
  support_url: function(pkg, support_url) {
    if (support_url.indexOf('mailto:') === 0 && mailhider) {
      pkg.support = mailhider.url(support_url.replace('mailto:', ''));
    }
    else {
      pkg.support = support_url;
    }
  },
  terms_of_service: 'terms',
  title: 'title',
  translations: 'translations',
  package_id: 'ubuntu_id',
  version: 'version',
  video_urls: function (pkg, video_urls) {
    pkg.videos = [];
    video_urls.forEach(function(video) {
      pkg.videos.push(utils.fixUrl(video));
    });
  },
  website: 'website',
  channels: 'channels',
  release: 'release',
  revision: 'revision',
  content: function(pkg, content) {
    if (pkg.download) {
      if (pkg.download.indexOf('.snap') == (pkg.download.length - 5)) {
        if (['oem', 'os', 'kernel', 'gadget', 'framework', 'application'].indexOf(content) >= 0) {
          pkg.type = 'snappy_' + content;
        }
      }
      else {
        if (content == 'application') {
          var desc = pkg.description.toLowerCase();
          if (desc.indexOf('webapp') > -1 || desc.indexOf('web app') > -1) {
            pkg.type = 'webapp';
          }
          else {
            pkg.type = 'application';
          }
        }
        else if (content == 'scope') {
          pkg.type = 'scope';
        }
      }
    }

    if (!pkg.type) {
      pkg.type = 'unknown';
    }
  },
};

function ubuntuToUAppExplorer(data) {
  var pkg = {};

  for (var dataProperty in propertyMap) {
    if (data[dataProperty]) {
      if (typeof(propertyMap[dataProperty]) == 'function') {
        propertyMap[dataProperty](pkg, data[dataProperty]);
      }
      else {
        pkg[propertyMap[dataProperty]] = data[dataProperty];
      }
    }
  }

  if (data._links && data._links.self && data._links.self.href) {
    pkg.url = utils.fixUrl(data._links.self.href);
  }

  if (data.allow_unauthenticated && data.anon_download_url) {
    pkg.download = data.anon_download_url;
  }

  if (takedowns.apps.indexOf(pkg.name) > -1) {
    pkg.takedown = true;
  }

  return pkg;
}

//TODO move this to the elastic search js file
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

function doFetchList(url, arch, results, callback) {
  results = results ? results : [];

  var headers = {};
  if (arch) {
    headers['X-Ubuntu-Architecture'] = arch;
  }

  request({url: url, headers: headers}, function(err, resp, body) {
    if (err) {
      callback(err);
    }
    else {
      var data = JSON.parse(body);
      logger.debug('got package list page: ' + url + ' (' + arch + ')');

      if (data && data._embedded && data._embedded['clickindex:package']) {
        results = results.concat(data._embedded['clickindex:package']);
      }

      if (data._links.next && data._links.next.href) {
        doFetchList(data._links.next.href, arch, results, callback);
      }
      else {
        callback(null, results);
      }
    }
  });
}

function parseArchPackages(packageMap, packages, arch) {
  packages.forEach(function(pkg) {
    if (packageMap[pkg.name]) {
      if (!packageMap[pkg.name].architecture) {
        packageMap[pkg.name].architecture = [];
      }

      if (packageMap[pkg.name].architecture.indexOf(arch) == -1 && packageMap[pkg.name].architecture.indexOf('all') == -1) {
        packageMap[pkg.name].architecture.push(arch);
      }
    }
    else {
      pkg.architecture = [arch];
      packageMap[pkg.name] = pkg;
    }
  });
}

function fetchList(callback) {
  var url = config.spider.search_api + '?size=' + config.spider.page_size;
  var fns = {
    all: function(callback) {
      doFetchList(url, null, null, callback);
    },
  };

  config.spider.architectures.forEach(function(arch) {
    fns[arch] = function(callback) {
      doFetchList(url, arch, null, callback);
    };
  });

  async.parallel(fns, function(err, results) {
    if (err) {
      callback(err);
    }
    else {
      config.spider.architectures.forEach(function(arch) {
        logger.debug(arch + ' packages: ' + results[arch].length);
      });
      logger.debug('all packages: ' + results.all.length);

      var packageMap = {};

      results.all.forEach(function(pkg) {
        if (packageMap[pkg.name]) {
          if (pkg.revision > packageMap[pkg.name].revision) {
            packageMap[pkg.name] = pkg;
          }
        }
        else {
          packageMap[pkg.name] = pkg;
        }
      });

      config.spider.architectures.forEach(function(arch) {
        parseArchPackages(packageMap, results[arch], arch);
      });

      logger.debug('total packages: ' + Object.keys(packageMap).length);

      callback(null, packageMap);
    }
  });
}

function parsePackageByUrl(url, arch, callback) {
  var headers = {};
  if (arch && arch != 'all') {
    headers['X-Ubuntu-Architecture'] = arch;
  }

  request({url: url, headers: headers}, function(err, resp, body) {
    if (err) {
      callback(err);
    }
    else {
      callback(null, JSON.parse(body));
    }
  });
}

//Parse a package pull from the api, not our own package format
function parseUbuntuPackage(data, callback) {
  var fns = {};
  data.architecture.forEach(function(arch) {
    fns[arch] = function(cb) {
      parsePackageByUrl(data._links.self.href, arch, cb);
    };
  });

  async.parallel(fns, function(err, results) {
    if (err) {
      callback(err);
    }
    else {
      var pkg_data = {};

      for (var arch2 in results) {
        results[arch2] = ubuntuToUAppExplorer(results[arch2]);

        if (!pkg_data.revision || results[arch2].revision > pkg_data.revision) {
          for (var key in results[arch2]) {
            pkg_data[key] = results[arch2][key];
          }
        }
      }

      pkg_data.architecture = data.architecture;
      pkg_data.downloads = {};
      for (var arch3 in results) {
        pkg_data.downloads[arch3] = results[arch3].download;
      }

      db.Package.findOne({name: pkg_data.name}, function(err, pkg) {
        if (err) {
          callback(err);
        }
        else {
          if (!pkg) {
            pkg = new db.Package();
          }

          for (var key in pkg_data) {
            pkg[key] = pkg_data[key];
          }

          pkg.save(function(err) {
            if (err) {
              logger.error('error saving package: ' + err);
              callback(err);
            }

            logger.debug('saved ' + pkg.name);
            callback(null, pkg);
          });
        }
      });
    }
  });
}

function parsePackages(updatesOnly, callback) {
  fetchList(function(err, packageMap) {
    db.Package.find({}, function(err, packages) {
      if (err) {
        callback(err);
      }
      else {
        var existingNames = [];
        var removals = []; //Our own package format

        //These are lists of packages pull from the api, not our own package format
        var updates = [];
        var additions = [];
        var all_packages = [];

        packages.forEach(function(pkg) {
          existingNames.push(pkg.name);

          if (packageMap[pkg.name]) { //Check for app updates
            all_packages.push(packageMap[pkg.name]);

            if (pkg.version != packageMap[pkg.name].version) {
              updates.push(packageMap[pkg.name]);

              logger.info('new version: ' + pkg.name + ' (' + pkg.version + ' != ' + packageMap[pkg.name].version + ')');
            }
          }
          else { //Check if any apps need to be removed
            logger.info('deleting ' + pkg.name);

            removals.push(pkg);
            pkg.remove(function(err) {
              if (err) {
                logger.error('Error removing ' + pkg.name + ': ' + err);
              }
            });

            //Don't need to remove form elasticsearch here, will be done at the end

            //Also remove review
            db.Review.findOne({name: pkg.name}, function(err, rev) {
              if (err) {
                logger.error('Error finding review to delete: ' + err);
              }
              else if (rev) {
                rev.remove(function(err) {
                  if (err) {
                    logger.error('Error removing review: ' + err);
                  }
                  else {
                    logger.debug('deleted reviews for ' + pkg.name);
                  }
                });
              }
            });
          }
        });

        if (updatesOnly) { //Check for new apps
          for (var name in packageMap) {
            if (existingNames.indexOf(name) == -1) {
              additions.push(packageMap[name]);

              logger.info('new app: ' + name);
            }
          }
        }

        if (updatesOnly) { //Only parse updates/additions/deletions
          logger.info(additions.length + ' additions, ' + updates.length + ' updates, ' + removals.length + ' removals');
          updates = updates.concat(additions);
        }
        else { //Reparse all packages
          updates = all_packages;
          logger.info(removals.length + ' removals, ' + all_packages.length + ' total apps');
        }

        var tasks = [];
        updates.forEach(function(update) {
          tasks.push(function(cb) {
            parseUbuntuPackage(update, cb);
          });
        });

        async.parallelLimit(tasks, 10, function(err, packages) {
          if (err) {
            logger.error('Error parsing package updates: ' + err);
          }

          if (updatesOnly) {
            async.eachSeries(packages, packageParser.parseClickPackage, function(err) {
              if (err) {
                logger.error(err);
              }

              mongoToElasticsearch(removals, callback);
            });
          }
          else { //Don't reparse the click files
            mongoToElasticsearch(removals, callback);
          }
        });
      }
    });
  });
}

function parsePackageByName(name, callback) {
  db.Package.findOne({name: name}, function(err, pkg) {
    if (err) {
      callback(err);
    }
    else {
      if (!pkg) {
        request({url: config.spider.packages_api + name}, function(err, resp, body) {
          if (err) {
            callback(err);
          }
          else {
            parseUbuntuPackage(JSON.parse(body), function(err, pkg) {
              if (err) {
                callback(err);
              }
              else {
                elasticsearchPackage.upsert(pkg, function(err) {
                  if (err) {
                    callback(err);
                  }
                  else {
                    callback(null, pkg);
                  }
                });
              }
            });
          }
        });
      }
      else {
        //Fake the data to call parseUbuntuPackage
        var data = {
          architecture: pkg.architecture,
          _links: {
            self: {
              href: pkg.url
            }
          }
        };

        parseUbuntuPackage(data, function(err, pkg) {
          if (err) {
            callback(err);
          }
          else {
            elasticsearchPackage.upsert(pkg, function(err) {
              if (err) {
                callback(err);
              }
              else {
                callback(null, pkg);
              }
            });
          }
        });
      }
    }
  });
}

exports.parsePackageByName = parsePackageByName;
exports.parsePackages = parsePackages;
exports.mongoToElasticsearch = mongoToElasticsearch;
