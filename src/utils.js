var logger = require('./logger');
var fs = require('fs');
var request = require('request');
var _ = require('lodash');

function niceBytes(bytes) {
  var unit = 'B';

  if (!bytes) {
    bytes = 0;
  }
  else if (bytes > 1024) {
    bytes /= 1024;
    unit = 'KB';

    if (bytes > 1024) {
      bytes /= 1024;
      unit = 'MB';

      if (bytes > 1024) {
        bytes /= 1024;
        unit = 'GB';

        if (bytes > 1024) {
          bytes /= 1024;
          unit = 'TB';
        }
      }
    }
  }

  return bytes.toFixed(1) + ' ' + unit;
}

function fixUrl(url) {
  if (!url) {
    url = '';
  }

  if (_.isArray(url)) {
    var newUrl = [];
    _.forEach(url, function(value) {
      newUrl.push(value.replace(/\\/g, ''));
    });

    url = newUrl;
  }
  else if (_.isObject(url)) {
    var urlObj = {};
    _.forEach(url, function(value, key) {
      urlObj[key] = value.replace(/\\/g, '');
    });

    url = urlObj;
  }
  else {
    url = url.replace(/\\/g, '');
  }

  return url;
}

function download(url, filename, callback) {
  var r = request(url);
  r.on('error', function(err) {
    logger.error(err);
    callback(err);
  }).on('close', function() {
    callback(null, r);
  }).pipe(fs.createWriteStream(filename));
}

function isJson(string) {
  var value = true;
  try {
    JSON.parse(string);
  }
  catch (e) {
    value = false;
  }

  return value;
}

exports.download = download;
exports.niceBytes = niceBytes;
exports.fixUrl = fixUrl;
exports.isJson = isJson;
