var server = require('./server')
var spider = require('./spider')
var logger = require('./logger')

spider.setupSchedule()
server.run()
