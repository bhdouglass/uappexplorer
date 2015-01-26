var server = require('./server')
var spider = require('./spider')

spider.setupSchedule()
server.run()
