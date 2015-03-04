var config = require('./config');
var winston = require('winston');
var papertrail = require('winston-papertrail');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({level: 'debug'})
  ]
});

logger.cli();

if (config.papertrail.port) {
  logger.add(papertrail.Papertrail, {
    host: config.papertrail.host,
    port: config.papertrail.port,
  });
}
else {
  logger.debug('No papertrail token');
}

module.exports = logger;
