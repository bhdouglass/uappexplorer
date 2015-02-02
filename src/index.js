var server = require('./server')
var spider = require('./spider')
var logger = require('./logger')

logger.info('Starting up: ' + new Date())
spider.setupSchedule()
server.run()
