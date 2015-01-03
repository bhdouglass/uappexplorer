var db = require('./db')
var config = require('./config')
var spider = require('./spider')
var express = require('express')
var _ = require('lodash')
var compression = require('compression')

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
app.use(express.static(__dirname + '/static'))
app.use('/images', express.static(config.data_dir, {maxage: '2d'}))

function success(res, data, message) {
  res.send({
    success: true,
    data: data,
    message: message ? message : null
  })
}

function error(res, message, code) {
  console.error('server: ' + message)

  res.status(code ? code : 500)
  res.send({
    success: false,
    data: null,
    message: message
  })
}

//TODO cache this to speed up requests
app.get('/api/categories', function(req, res) {
  db.Package.find({}, 'categories', function(err, pkgs) {
    if (err) {
      error(res, err)
    }
    else {
      var categories = []
      _.forEach(pkgs, function(pkg) {
        _.forEach(pkg.categories, function(category) {
          if (categories.indexOf(category) == -1) {
            categories.push(category);
          }
        });
      })

      categories = _.sortBy(categories)
      success(res, categories)
    }
  })
});

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
            new_pkgs.push({
              name: pkg.name,
              icon_filename: pkg.icon_filename,
              title: pkg.title,
              type: pkg.type,
              average_rating: pkg.average_rating,
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
      spider.fetchReviews(pkg, function(pkg2) {
        success(res, {
          reviews: pkg2.reviews,
          name: pkg2.name,
        })
      })
    }
  })
})

function run() {
  var server = app.listen(config.server.port, config.server.ip, function () {
    var host = server.address().address
    var port = server.address().port

    console.log('server: listening at http://%s:%s', host, port)
  })
}

exports.run = run
