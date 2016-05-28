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

process.on('uncaughtException', function(err) {
  logger.error(err);

  if (err && err.stack) {
    logger.error(err.stack);
  }
});

module.exports = logger;
