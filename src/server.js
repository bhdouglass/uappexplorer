var db = require('./db')
var config = require('./config')
var spider = require('./spider')
var utils = require('./utils')
var logger = require('./logger')
var express = require('express')
var _ = require('lodash')
var compression = require('compression')
var moment = require('moment')
var prerender = require('prerender-node')
var fs = require('fs')
var mime = require('mime')
var moment = require('moment')

var app = express()

app.use(compression({
  threshold: 512,
  filter: function(req, res) {
    if (res.getHeader('content-type') == 'image/png') {
      return true;
    }

    return compression.filter(req, res);
  }
}))
app.use(prerender.whitelisted(['/app/.*', '/apps']))
app.use(express.static(__dirname + '/static'))

function success(res, data, message) {
  res.send({
    success: true,
    data: data,
    message: message ? message : null
  })
}

function error(res, message, code) {
  logger.error('server: ' + message)

  res.status(code ? code : 500)
  res.send({
    success: false,
    data: null,
    message: message
  })
}

app.get('/api/icon/:name', function(req, res) {
  db.Package.findOne({name: req.params.name}, function(err, pkg) {
    if (err) {
      error(res, err)
    }
    else if (!pkg) {
      error(res, req.params.name + ' was not found', 404) //TODO: 404 image?
    }
    else {
      if (pkg.icon) {
        if (!pkg.icon_filename) {
          pkg.icon_filename = pkg.icon.replace('https://', '').replace('http://', '').replace(/\//g, '-')
        }

        var now = moment()
        var filename = config.data_dir + '/' + pkg.icon_filename
        fs.exists(filename, function(exists) {
          if (exists && now.diff(pkg.icon_fetch_date, 'days') <= 2) {
            res.setHeader('Content-type', mime.lookup(filename))
            res.setHeader('Cache-Control', 'public, max-age=172800'); //2 days
            fs.createReadStream(filename).pipe(res)
          }
          else {
            utils.download(pkg.icon, filename, function(r) {
              pkg.icon_fetch_date = now.valueOf()
              logger.debug(filename + ' finished downloading')

              res.setHeader('Content-type', mime.lookup(filename))
              res.setHeader('Cache-Control', 'public, max-age=172800'); //2 days
              fs.createReadStream(filename).pipe(res)
            })
          }
        })
      }
      else {
        error(res, req.params.name + ' was not found', 404) //TODO: 404 image?
      }
    }
  })
})

app.get('/api/categories', function(req, res) {
  db.Department.find({}, function(err, deps) {
    if (err) {
      error(res, err)
    }
    else {
      deps = _.sortBy(deps, 'name')
      success(res, deps)
    }
  })
})

var frameworks = []
var frameworks_date = null;
app.get('/api/frameworks', function(req, res) {
  var now = moment()
  if (!frameworks_date || now.diff(frameworks_date, 'hours') > 12 || frameworks.length == 0) { //Cache miss
    db.Package.find({}, 'framework', function(err, pkgs) {
      if (err) {
        error(res, err)
      }
      else {
        frameworks = []
        _.forEach(pkgs, function(pkg) {
          _.forEach(pkg.framework, function(framework) {
            if (frameworks.indexOf(framework) == -1) {
              frameworks.push(framework);
            }
          });
        })

        frameworks = _.sortBy(frameworks)
        frameworks_date = moment()
        success(res, frameworks)
      }
    })
  }
  else { //Cache hit
    success(res, frameworks)
  }
})

//TODO cache this to speed up requests
app.get('/api/apps', function(req, res) {
  var findQuery = req.query.query ? JSON.parse(req.query.query) : {}
  if (req.query.count == 'true') {
    var query = db.Package.count(findQuery)

    if (req.query.search) {
      var regxp = new RegExp(req.query.search, 'i')
      query.or([
        {author: regxp},
        {company: regxp},
        {title: regxp},
        {description: regxp},
        {keywords: regxp}
      ])
    }

    query.exec(function(err, count) {
      if (err) {
        error(res, err)
      }
      else {
        success(res, count)
      }
    })
  }
  else {
    var query = db.Package.find(findQuery)

    if (req.query.limit) {
      query.limit(req.query.limit)
    }

    if (req.query.skip) {
      query.skip(req.query.skip)
    }

    if (req.query.sort) {
      query.sort(req.query.sort)
    }

    if (req.query.search) {
      var regxp = new RegExp(req.query.search, 'i')
      query.or([
        {author: regxp},
        {company: regxp},
        {title: regxp},
        {description: regxp},
        {keywords: regxp}
      ])
    }

    query.exec(function(err, pkgs) {
      if (err) {
        error(res, err)
      }
      else {
        if (req.query.mini == 'true') {
          var new_pkgs = []
          _.forEach(pkgs, function(pkg) {
            var description = pkg.description;
            if (pkg.description && pkg.description.split('\n').length > 0) {
              description = pkg.description.split('\n')[0];
            }

            new_pkgs.push({
              name: pkg.name,
              icon_filename: pkg.icon_filename,
              title: pkg.title,
              type: pkg.type,
              average_rating: pkg.average_rating,
              prices: pkg.prices,
              short_description: description,
            })
          })

          pkgs = new_pkgs;
        }

        success(res, pkgs)
      }
    })
  }
})

app.get('/api/apps/:name', function(req, res) {
  db.Package.findOne({name: req.params.name}, function(err, pkg) {
    if (err) {
      error(res, err)
    }
    else if (!pkg) {
      error(res, req.params.name + ' was not found', 404)
    }
    else {
      pkg.reviews = undefined
      success(res, pkg)
    }
  })
})

app.get('/api/apps/reviews/:name', function(req, res) {
  db.Package.findOne({name: req.params.name}, function(err, pkg) {
    if (err) {
      error(res, err)
    }
    else if (!pkg) {
      error(res, req.params.name + ' was not found', 404)
    }
    else {
      spider.parseReviews(pkg, function(pkg2) {
        success(res, {
          reviews: pkg2.reviews,
          name: pkg2.name,
        })
      })
    }
  })
})

app.all(['/apps', '/app/:name'], function(req, res, next) { //For html5mode on frontend
  res.sendFile('index.html', {root: __dirname + '/static'});
});

function run() {
  var server = app.listen(config.server.port, config.server.ip, function() {
    var host = server.address().address
    var port = server.address().port

    logger.info('listening at http://%s:%s', host, port)
  })
}

exports.run = run
