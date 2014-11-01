var fs = require('fs')
var request = require('request')
var _ = require('lodash')

function niceBytes(bytes) {
  var unit = 'B'

  if (!bytes) {
    bytes = 0
  }
  else if (bytes > 1024) {
    bytes /= 1024
    unit = 'KB'

    if (bytes > 1024) {
      bytes /= 1024
      unit = 'MB'

      if (bytes > 1024) {
        bytes /= 1024
        unit = 'GB'

        if (bytes > 1024) {
          bytes /= 1024
          unit = 'TB'
        }
      }
    }
  }

  return bytes + ' ' + unit
}

function fixUrl(url) {
  if (!url) {
    url = ''
  }

  if (_.isArray(url)) {
    var newUrl = [];
    _.forEach(url, function(value) {
      newUrl.push(value.replace(/\\/g, ''))
    })

    url = newUrl
  }
  else if (_.isObject(url)) {
    var newUrl = {};
    _.forEach(url, function(value, key) {
      newUrl[key] = value.replace(/\\/g, '')
    })

    url = newUrl
  }
  else {
    url = url.replace(/\\/g, '')
  }

  return url
}

function download(url, filename, callback) {
  request(url).pipe(fs.createWriteStream(filename)).on('close', callback)
}

exports.download = download
exports.niceBytes = niceBytes
exports.fixUrl = fixUrl
