var spider = require('./spider')

if (process.argv[2]) {
  if (process.argv[2] == 'update' || process.argv[2] == 'updates') {
    spider.parsePackageUpdates(function() {
      process.exit(0)
    })
  }
  else if (process.argv[2] == 'department' || process.argv[2] == 'departments') {
    spider.parseDepartments()
  }
  else {
    spider.parsePackage(process.argv[2], function(err) {
      if (err) {
        process.exit(1)
      }
    })
  }
}
else {
  spider.parsePackages(function() {
    process.exit(0)
  })
}
