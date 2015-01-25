var worker = require('node_helper')
var spider = require('./spider')

console.log('params: ', worker.params)
console.log('task_id: ', worker.task_id)
spider.parsePackage(worker.params.package, function(err) {
  if (err) {
    process.exit(1)
  }

  process.exit(0)
})
