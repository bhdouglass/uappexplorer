var spider = require('./spider')

if (process.argv[2]) {
  if (process.argv[2] == 'update' || process.argv[2] == 'updates') {
    spider.parsePackageUpdates(true)
  }
  else if (process.argv[2] == 'department' || process.argv[2] == 'departments') {
    spider.parseDepartments()
  }
  else {
    spider.parsePackage(process.argv[2])
  }
}
else {
  spider.parsePackages(true)
}
