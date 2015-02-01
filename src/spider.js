var config = require('./config')
var utils = require('./utils')
var db = require('./db')
var request = require('request')
var _ = require('lodash')
var moment = require('moment')
var async = require('async')
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
    if (data[dataProperty] !== undefined) {
      pkg[pkgProperty] = data[dataProperty]

      if (dataProperty.indexOf('_url') > -1) {
        pkg[pkgProperty] = utils.fixUrl(pkg[pkgProperty])
      }
      else if (pkgProperty == 'filesize') {
        pkg[pkgProperty] = utils.niceBytes(pkg[pkgProperty])
      }
      else if (pkgProperty == 'description') {
        if (pkg[pkgProperty]) {
          var split = pkg[pkgProperty].replace('\r', '').split('\n')
          if (split.length == 2 && split[0] == split[1]) { //Remove duplicated second line
            pkg[pkgProperty] = split[0].replace('\n', '')
          }
        }
      }
    }
  })

  return pkg
}

function parsePackage(name, callback) {
  var url = config.spider.packages_api + name
  console.log('parsing ' + url)
  request(url, function(err, resp, body) {
    if (err) {
      console.error('error requesting url: ' + err)
      callback(err)
    }
    else {
      var data = JSON.parse(body)
      db.Package.findOne({name: data.name}, function(err, pkg) {
        if (err) {
          console.error('error finding package: ' + err)
          callback(err)
        }
        else {
          if (!pkg) {
            pkg = new db.Package()
          }

          pkg = map(pkg, data)
          pkg.url = utils.fixUrl(data._links.self.href)
          pkg.icon_filename = pkg.icon.replace('https://', '').replace('http://', '').replace(/\//g, '-')

          pkg.save(function(err, pkg) {
            if (err) {
              console.error('error saving package: ' + err)
              callback(err)
            }

            console.log('saved ' + name)
            callback()
          })
        }
      })
    }
  })
}

function fetchListPage(page, packageList, callback) {
  request(config.spider.search_api + '?size=100&page=' + page, function(err, resp, body) {
    if (err) {
      console.error('error fetching page #' + page + ': ' + err)
    }
    else {
      var data = JSON.parse(body)
      console.log('got package list page #' + page)
      if (data['_embedded'] && data['_embedded']['clickindex:package']) {
        if (_.isArray(packageList)) {
          packageList = packageList.concat(data['_embedded']['clickindex:package'])
        }
        else {
          packageList = data['_embedded']['clickindex:package']
        }

        fetchListPage(page + 1, packageList, callback)
      }
      else {
        callback(packageList)
      }
    }
  })
}

function fetchList(callback) {
  fetchListPage(1, [], callback)
}

function saveDepartment(d, callback) {
  console.log(d.name)
  db.Department.findOne({name: d.name}, function(err, dep) {
    if (err) {
      console.error('error finding ' + d.name + ': ' + err)
      callback(err)
    }
    else if (!dep) {
      dep = new db.Department()
    }

    dep.name = d.name
    dep.internal_name = d.slug
    dep.url = utils.fixUrl(d._links.self.href)
    dep.save(function(err, dep) {
      if (err) {
        console.error('error saving department: ' + err)
        callback(err)
      }
      else {
        console.log('saved ' + d.name)
        callback()
      }
    })
  })
}

function parseDepartments() {
  request(config.spider.departments_api, function(err, resp, body) {
    if (err) {
      console.error('error fetching departments: ' + err)
    }
    else {
      data = JSON.parse(body)
      if (data['_embedded'] && data['_embedded']['clickindex:department']) {
        async.each(data['_embedded']['clickindex:department'], saveDepartment, function(err) {
          if (err) {
            console.error(err)
          }
        })
      }
    }
  })
}

function parseReviews(pkg, callback) {
  var now = moment()
  if (!pkg.reviews_fetch_date || now.diff(pkg.reviews_fetch_date, 'days') >= 1) {
    request(config.spider.reviews_api + '?package_name=' + pkg.name, function(err, resp, body) {
      if (err) {
        console.error('spider error: ' + err)
        callback(pkg)
      }
      else {
        pkg.reviews = JSON.parse(body)
        pkg.reviews_fetch_date = now.valueOf()

        pkg.save(function(err, pkg2) {
          if (err) {
            console.error('spider error: ' + err)
            callback(pkg)
          }
          else {
            callback(pkg2)
          }
        })
      }
    })
  }
  else {
    callback(pkg)
  }
}

function parsePackageUpdates(callback) {
  console.log('parsing package updates')
  fetchList(function(list) {
    var newList = [];
    async.each(list, function(data, callback) {
      db.Package.findOne({name: data.name}, function(err, pkg) {
        if (err) {
          console.error('error finding ' + data.name + ': ' + err)
          callback(err)
        }
        else if (!pkg || pkg.version != data.version) {
          newList.push(data.name)
          callback(null)
        }
        else {
          callback(null)
        }
      })
    }, function(err) {
      console.log('parsing ' + newList.length + '/' + list.length + ' updates')
      async.eachSeries(newList, parsePackage, function(err) {
        if (err) {
          console.error(err)
        }

        if (callback) {
          callback()
        }
      })
    })
  })
}

function parsePackages(callback) {
  console.log('parsing all packages')
  fetchList(function(list) {
    var newList = [];
    _.forEach(list, function(data) {
      newList.push(data.name)
    })

    async.eachSeries(newList, parsePackage, function(err) {
      if (err) {
        console.error(err)
      }

      if (callback) {
        callback()
      }
    })
  })
}

function setupSchedule() {
  console.log('scheduling spider')
  var spider_rule = new schedule.RecurrenceRule()
  spider_rule.dayOfWeek = 1
  spider_rule.hour = 0
  spider_rule.minute = 0

  var spider_job = schedule.scheduleJob(spider_rule, function() {
    parsePackages()
  })

  var spider_rule_updates = new schedule.RecurrenceRule()
  spider_rule_updates.dayOfWeek = new schedule.Range(0, 6, 1)
  spider_rule_updates.hour = new schedule.Range(0, 23, 4)
  spider_rule_updates.minute = 0

  var spider_job_updates = schedule.scheduleJob(spider_rule_updates, function() {
    parsePackageUpdates()
  })

  var department_rule = new schedule.RecurrenceRule()
  department_rule.dayOfWeek = 0
  department_rule.hour = 0
  department_rule.minute = 0

  var department_job = schedule.scheduleJob(department_rule, function() {
    console.log('spider: running department spider')
    parseDepartments()
  })
}

exports.parsePackage = parsePackage
exports.parsePackages = parsePackages
exports.parsePackageUpdates = parsePackageUpdates
exports.parseReviews = parseReviews
exports.parseDepartments = parseDepartments
exports.setupSchedule = setupSchedule
