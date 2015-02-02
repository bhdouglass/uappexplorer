var config = require('./config')
var logentries = require('node-logentries')
var winston = require('winston')
var util = require('util')

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({level: 'debug'})
  ]
});

logger.cli()

if (config.logentries.token) {
  var log = logentries.logger({
    token: config.logentries.token
  })

  var LogentriesLogger = winston.transports.LogentriesLogger = function(options) {
    options = options || {}
    this.name = 'logentries'
    this.level = options.level || 'info'
  }

  util.inherits(LogentriesLogger, winston.Transport)
  LogentriesLogger.prototype.log = function(level, msg, meta, callback) {
    var data = msg
    if (meta && Object.keys(meta)) {
      data + ' ' + JSON.stringify(meta)
    }

    log.log(level, data)
    callback(null, true)
  }

  logger.add(LogentriesLogger)
}
else {
  logger.debug('No logentries token')
}

module.exports = logger
