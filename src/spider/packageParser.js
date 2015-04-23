var utils = require('../utils');
var db = require('../db');
var logger = require('../logger');
var config = require('../config');
var request = require('request');
var OAuth = require('oauth-1.0a');
var fs = require('fs');
var ar = require('ar');
var tar = require('tar');
var zlib = require('zlib');
var _ = require('lodash');
var async = require('async');

var oauth = null;
var token = null;

function unlink(files) {
  _.forEach(files, function(file) {
    if (_.isArray(file)) {
      unlink(file);
    }
    else {
      if (file.indexOf(config.tmp_dir) !== 0) {
        file = config.tmp_dir + '/' + file.replace(/\//g, '__');
      }

      fs.unlink(file);
    }
  });
}

function checkSnappy(data, callback) {
  var found = false;
  fs.createReadStream(data)
  .on('error', function(err) {
    callback(err);
  })
  .pipe(zlib.Unzip())
  .pipe(tar.Parse())
  .on('entry', function(entry) {
    if (entry.path == './meta/package.yaml') {
      found = true;
      callback(null, true);
    }
  })
  .on('end', function() {
    if (!found) {
      callback('Could not find package.yaml');
    }
  });
}

function extractData(data, file, callback) {
  var write_file = config.tmp_dir + '/' + file.replace(/\//g, '__');
  var f = fs.createWriteStream(write_file)
  .on('finish', function() {
    var webapp = false;
    var fdata = fs.readFileSync(write_file, {encoding: 'utf8'});
    fdata = fdata.split('\n');

    _.forEach(fdata, function(line) {
      line = line.toLowerCase().trim();
      if (line.indexOf('exec=') === 0) {
        line = line.replace('exec=', '').trim();
        if (line.indexOf('webapp-container') === 0) {
          webapp = true;
        }
      }
    });

    callback(null, webapp);
  });

  var found = false;
  fs.createReadStream(data)
  .on('error', function(err) {
    callback(err);
  })
  .pipe(zlib.Unzip())
  .pipe(tar.Parse())
  .on('entry', function(entry) {
    if (entry.path == './' + file) {
      entry.pipe(f);
      found = true;
    }
  })
  .on('end', function() {
    if (!found) {
      callback('Could not find desktop file: ' + file);
    }
  });
}

function parseControl(pkg, files, callback) {
  var data = fs.readFileSync(files.manifest, {encoding: 'utf8'});
  if (utils.isJson(data)) {
    data = JSON.parse(data);
    if (!data.hooks || Object.keys(data.hooks).length === 0) {
      callback('Missing hooks in manifest');
    }
    else {
      var type = [];
      _.forEach(data.hooks, function(hook) {
        if (hook.desktop) {
          type.push('application');
          files.desktops.push(hook.desktop);
        }
        else if (hook['bin-path'] || hook['snappy-systemd']) {
          type.push('snappy');
        }
        else if (hook.scope) {
          type.push('scope');
        }
      });

      if (type.length === 0) {
        unlink(files);
        callback('No app or scope found in manifest');
      }
      else {
        pkg.types = _.uniq(type);
        callback();
      }
    }
  }
  else {
    unlink(files);
    callback('Invalid json in manifest');
  }
}

function extractControl(pkg, files, callback) {
  var f = fs.createWriteStream(files.manifest)
  .on('finish', function() {
    parseControl(pkg, files, callback);
  });

  var found = false;
  fs.createReadStream(files.control)
  .on('error', function(err) {
    callback(err);
  })
  .pipe(zlib.Unzip())
  .pipe(tar.Parse())
  .on('entry', function(entry) {
    if (entry.path.substring(2) == 'manifest') {
      entry.pipe(f);
      found = true;
    }
  })
  .on('end', function() {
    if (!found) {
      callback('Could not find manifest file');
    }
  });
}

function parseDownload(pkg, callback) {
  var files = {
    click: config.tmp_dir + '/' + pkg.name + '.click',
    data: config.tmp_dir + '/' + pkg.name + '.tar.gz',
    manifest: config.tmp_dir + '/' + pkg.name + '.manifest',
    control: config.tmp_dir + '/' + pkg.name + '.control.tar.gz',
    desktops: []
  };

  var foundData = false;
  var foundControl = false;
  var archive = new ar.Archive(fs.readFileSync(files.click));
  _.forEach(archive.getFiles(), function(file) {
    if (file.name() == 'data.tar.gz') {
      fs.writeFileSync(files.data, file.fileData());
      foundData = true;
    }
    else if (file.name() == 'control.tar.gz') {
      fs.writeFileSync(files.control, file.fileData());
      foundControl = true;
    }
  });

  if (!foundData || !foundControl) {
    callback('Malformed click package');
  }
  else {
    pkg.types = [];
    extractControl(pkg, files, function(err) {
      if (err) {
        checkSnappy(files.data, function(err2, snappy) {
          if (err2) {
            callback(err + ' ' + err2);
          }
          else {
            if (snappy) {
              pkg.types = ['snappy'];
              pkg.save(callback);
            }
            else {
              callback(err);
            }
          }
        });
      }
      else {
        //Check if it's a web app
        if (pkg.types.indexOf('application') > -1) {
          var webapps = [];
          async.eachSeries(files.desktops, function(file, cb) {
            extractData(files.data, file, function(err, webapp) {
              if (err) {
                cb(err);
              }
              else {
                webapps.push(webapp);
                cb();
              }
            });
          }, function(err) {
            if (err) {
              callback(err);
            }
            else {
              if (webapps.length > 0 && webapps.length == _.compact(webapps).length) { //All the apps included are webapps
                var index = pkg.types.indexOf('application');
                pkg.types.splice(index, 1);
                pkg.types.push('webapp');
              }
              else { //Not all the apps are webapps (if any)
                _.forEach(webapps, function(webapp) {
                  if (webapp) {
                    pkg.types.push('webapp');

                    return false;
                  }
                });
              }

              pkg.save(callback);
            }

            unlink(files);
          });
        }
        else {
          unlink(files);
          pkg.save(callback);
        }
      }
    });
  }
}

function downloadPackage(pkg, callback) {
  var request_data = {
      url: pkg.download,
      method: 'GET',
  };

  var r = request({
      url: request_data.url,
      method: request_data.method,
      headers: oauth.toHeader(oauth.authorize(request_data, token))
  });

  r.on('error', function(err) {
    callback(err);
  })
  .on('response', function(response) {
    if (response.statusCode == 200) {
      var f = fs.createWriteStream(config.tmp_dir + '/' + pkg.name + '.click');
      f.on('finish', function() {
        parseDownload(pkg, callback);
      });

      r.pipe(f);
    }
    else {
      callback('Failed to get click package: ' + response.statusCode);
    }
  });
}

function fetchOAuth(callback) {
  request({
    url: 'https://login.ubuntu.com/api/v2/tokens/oauth',
    method: 'POST',
    json: {
      email: config.ubuntu_sso.email, //TODO get from config
      password: config.ubuntu_sso.password, //TODO get from config
      token_name: config.ubuntu_sso.token_name,
    }
  }, function(err, resp, body) {
    if (err) {
      callback(err);
    }
    else {
      oauth = new OAuth({
          consumer: {
              public: body.consumer_key,
              secret: body.consumer_secret
          },
          signature_method: 'HMAC-SHA1'
      });

      token = {
          public: body.token_key,
          secret: body.token_secret
      };

      callback();
    }
  });
}

function fallbackType(pkg, callback) {
  pkg.types = [pkg.type];
  pkg.save(callback);
}

function parseClickPackage(pkg, callback) {
  logger.debug('Going to parse ' + pkg.name);

  if (!oauth || !token) {
    fetchOAuth(function(err) {
      if (err) {
        callback(err);
      }
      else {
        downloadPackage(pkg, function(err) {
          if (err) {
            logger.error('Failed to determine package type for ' + pkg.name + ', falling back: ' + err);
            fallbackType(pkg, callback);
          }
          else {
            callback();
          }
        });
      }
    });
  }
  else {
    downloadPackage(pkg, function(err) {
      if (err) {
        logger.error('Failed to determine package type for ' + pkg.name + ', falling back: ' + err);
        fallbackType(pkg, callback);
      }
      else {
        callback();
      }
    });
  }
}

function parseClickPackageByName(name, callback) {
  db.Package.findOne({name: name}, function(err, pkg) {
    if (err) {
      logger.error('Error finding package: ' + err);
      callback(err);
    }
    else if (!pkg) {
      logger.error('Could not find ' + name);
      callback('Could not find ' + name);
    }
    else {
      parseClickPackage(pkg, function(err) {
        if (err) {
          logger.error(err);
        }
        else {
          logger.debug(JSON.stringify(pkg.types));
        }

        callback(err);
      });
    }
  });
}

function parseAllClickPackages(callback) {
  db.Package.find({}, function(err, pkgs) {
    if (err) {
      logger.error('Error finding package: ' + err);
      callback(err);
    }
    else {
      logger.info('Going to parse ' + pkgs.length + ' packages');
      async.eachSeries(pkgs, parseClickPackage, function(err) {
        if (err) {
          logger.error(err);
        }

        logger.info('Finished parsing click packages');

        if (callback) {
          callback();
        }
      });
    }
  });
}

exports.parseClickPackage = parseClickPackage;
exports.parseClickPackageByName = parseClickPackageByName;
exports.parseAllClickPackages = parseAllClickPackages;
