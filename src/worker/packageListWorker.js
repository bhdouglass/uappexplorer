var worker = require('node_helper')
var spider = require('./spider')

console.log('params: ', worker.params)
console.log('task_id: ', worker.task_id)

if (worker.params && worker.params.full) {
  spider.parsePackages()
}
else {
  spider.parsePackageUpdates()
}
