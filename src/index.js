var server = require('./server')
var spider = require('./spider')
var logger = require('./logger')
var config = require('./config')

if (config.use_spider()) {
  spider.setupSchedule()
}

if (config.use_app() || config.use_api()) {
  server.run()
}
