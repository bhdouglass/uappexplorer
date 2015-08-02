var db = require('../db/db');
var logger = require('../logger');
var config = require('../config');
var request = require('request');
var OAuth = require('oauth-1.0a');
var fs = require('fs');
var async = require('async');
var parse = require('click-parser');
var _ = require('lodash');

var oauth = null;
var token = null;

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
      var filename = config.tmp_dir + '/' + pkg.name + '.click';
      var f = fs.createWriteStream(filename);
      f.on('error', function(err) {
        callback(err);
      });
      f.on('finish', function() {
        parse(filename, function(err, data) {
          if (err) {
            callback(err);
          }
          else {
            fs.unlink(filename);
            if (data.types) {
              pkg.types = _.uniq(data.types);
            }

            pkg.webapp_inject = data.webappInject;
            pkg.save(callback);
          }
        });
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
      email: config.ubuntu_sso.email,
      password: config.ubuntu_sso.password,
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
