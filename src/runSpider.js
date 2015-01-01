var spider = require('./spider')

if (process.argv[2]) {
  spider.parsePackage({
    name: process.argv[2],
    _links: {
      self: {
        href: 'https://search.apps.ubuntu.com/api/v1/package/' + process.argv[2]
      }
    }
  })(function(err, pkg) {
    spider.parseExtendedPackage(pkg)(function() {})
  })
}
else {
  spider.run()
}
