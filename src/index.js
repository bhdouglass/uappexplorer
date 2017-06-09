var server = require('./server/server');
var spider = require('./spider');
var config = require('./config');
var logger = require('./logger');
var cluster = require('cluster');
var os = require('os');

if (cluster.isMaster) {
  if (config.use_spider()) {
    spider.setupSchedule();

    if (!config.use_app() && !config.use_api()) {
      spider.server();
    }
  }

  if (config.use_app() || config.use_api()) {
    var cpus = os.cpus().length;
    var processes = cpus;
    if (config.server.process_limit > 0 && cpus > config.server.process_limit) {
      processes = config.server.process_limit;
      logger.debug('limiting processes to ' + processes + ' (CPUs: ' + cpus + ')');
    }
    else {
      logger.debug('spawning ' + processes + ' processes');
    }

    for (var i = 0; i < processes; i += 1) {
      cluster.fork();
    }

    cluster.on('exit', function() {
      cluster.fork();
    });
  }
}
else {
  if (config.use_app() || config.use_api()) {
    server.run();
  }
}
