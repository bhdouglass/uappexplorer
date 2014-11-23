var express = require('express')
var db = require('./api/db')
var _ = require('lodash')

var server_port = process.env.OPENSHIFT_NODEJS_PORT || process.env.NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || process.env.NODEJS_IP || '127.0.0.1'
var data_dir = process.env.OPENSHIFTDATADIR || process.env.DATADIR || '/tmp'
var app = express()

app.use(express.static(__dirname + '/static'))
app.use('/images', express.static(data_dir))

function success(res, data, message) {
  res.send({
    success: true,
    data: data,
    message: message ? message : null
  })
}

function error(res, message, code) {
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
      success(res, pkg)
    }
  })
})

var server = app.listen(server_port, server_ip_address, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('Listening at http://%s:%s', host, port)
})
