var https = require('https')
var _ = require('lodash')
var db = require('./db')
var utils = require('./utils')
var async = require('async')
var request = require('request')
var schedule = require('node-schedule')

var propertyMap = {
  architecture:   'architecture',
  author:         'developer_name',
  average_rating: 'ratings_average',
  categories:     'department',
  changelog:      'changelog',
  company:        'company_name',
  description:    'description',
  download:       'download_url',
  filesize:       'binary_filesize',
  framework:      'framework',
  icon:           'icon_url',
  icons:          'icon_urls',
  keywords:       'keywords',
  last_updated:   'last_updated',
  license:        'license',
  name:           'name',
  prices:         'prices',
  published_date: 'date_published',
  screenshot:     'screenshot_url',
  screenshots:    'screenshot_urls',
  status:         'status',
  support:        'support_url',
  terms:          'terms_of_service',
  title:          'title',
  type:           'content',
  version:        'version',
  videos:         'video_urls',
  website:        'website',
}

function map(pkg, data) {
  _.forEach(propertyMap, function(dataProperty, pkgProperty) {
    pkg[pkgProperty] = data[dataProperty]
    if (dataProperty.indexOf('_url') > -1) {
      pkg[pkgProperty] = utils.fixUrl(pkg[pkgProperty])
    }
    else if (pkgProperty == 'filesize') {
      pkg[pkgProperty] = utils.niceBytes(pkg[pkgProperty])
    }
  })

  return pkg
}

function parseExtendedPackage(pkg) {
  return function(callback) {
    setTimeout(function() {
      console.log('spider: ' + pkg.url)
      request(pkg.url, function(err, resp, body) {
        if (err) {
          console.error('spider: ' + err)
        }
        else {
          data = JSON.parse(body)
          pkg = map(pkg, data)
          pkg.icon_filename = pkg.icon.replace('https://', '').replace('http://', '').replace(/\//g, '-')
          console.log('spider: ' + pkg.icon_filename)

          pkg.save(function(err, pkg) {
            if (err) {
              console.error('spider: ' + err)
              callback(err)
            }
            else {
              var path = process.env.OPENSHIFTDATADIR || process.env.DATADIR || '/tmp'
              var filename = path + '/' + pkg.icon_filename

              utils.download(pkg.icon, filename, function() {
                console.log('spider: ' + filename + ' finished downloading')
              })
              callback(null, pkg)
            }
          })
        }
      })
    }, 30 * 1000)
  }
}

function parsePackage(data) {
  return function(callback) {
    //TODO change to findOne
    db.Package.find({name: data.name}, function(err, packages) {
      var pkg = null
      if (err) {
        console.error('spider: ' + err)
      }
      else if (packages.length == 0) {
        pkg = new db.Package()
      }
      else {
        pkg = packages[0]
      }

      pkg = map(pkg, data)
      pkg.url = utils.fixUrl(data._links.self.href)
      pkg.save(function(err, pkg) {
        if (err) {
          console.error('spider: ' + err)
          callback(err)
        }
        else {
          callback(null, pkg)
        }
      })
    })
  }
}

function parsePackageList(list) {
  var packageCallbacks = []
  var packageNames = []
  _.forEach(list, function(pkg) {
    packageCallbacks.push(parsePackage(pkg))
    packageNames.push(pkg.name)
  })
  console.log('spider: done parsing package list')

  db.Package.find({}, function(err, packages) {
    if (err) {
      console.error('spider: ' + err)
    }
    else {
      _.forEach(packages, function(pkg) {
        if (packageNames.indexOf(pkg.name) == -1) {
          console.log('spider: deleting ' + pkg.name);
          pkg.remove(function(err) {
            if (err) {
              console.error('spider: ' + err)
            }
          })
        }
      })
    }
  })

  async.parallel(packageCallbacks, function(err, pkgs) {
    console.log('spider: done saving packages')

    var extendedCallbacks = []
    _.forEach(pkgs, function(pkg) {
      if (pkg) {
        extendedCallbacks.push(parseExtendedPackage(pkg))
      }
    })

    //For testing
    //var extendedCallbacks = [extendedCallbacks[0]]
    async.series(extendedCallbacks, function(err, results) {
      if (err) {
        console.error('spider: ' + err)
      }

      console.log('spider: done spidering')
    })
  })
}

//TODO: make option to only download new packages
function run() {
  console.log('spider: fetching package list')
  request('https://search.apps.ubuntu.com/api/v1/search', function(err, resp, body) {
    data = JSON.parse(body)
    console.log('spider: got package list')
    parsePackageList(data['_embedded']['clickindex:package'])
  })
}

function setupSchedule() {
  console.log('spider: scheduling spider');
  var spider_rule = new schedule.RecurrenceRule()
  spider_rule.dayOfWeek = [0, 2, 4]
  spider_rule.hour = 0
  spider_rule.minute = 0

  var spider_job = schedule.scheduleJob(spider_rule, function() {
    console.log('spider: running spider')
    run()
  });
}

exports.run = run
exports.schedule = setupSchedule
