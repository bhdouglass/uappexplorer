var server = require('./server/server');
var spider = require('./spider/spider');
var config = require('./config');
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

    for (var i = 0; i < cpus; i += 1) {
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
