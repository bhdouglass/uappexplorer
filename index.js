var express = require('express')
var db = require('./api/db')

var server_port = process.env.OPENSHIFT_NODEJS_PORT || process.env.NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || process.env.NODEJS_IP || '127.0.0.1'
var app = express()

app.use(express.static(__dirname + '/static'))

function success(res, data) {
  res.send({
    success: true,
    data: data,
    message: null
  })
}

app.get('/api/categories', function(req, res) {
  //TODO
});

app.get('/api/apps', function(req, res) {
  db.Package.find({}, function(err, pkgs) {
    //TODO paging
    //TODO error handling and 404s
    //TODO option for slim list
    success(res, pkgs)
  })
})

app.get('/api/apps/:name', function(req, res) {
  db.Package.findOne({name: req.params.name}, function(err, pkg) {
    //TODO error handling and 404s
    success(res, pkg)
  })
})

var server = app.listen(server_port, server_ip_address, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('Listening at http://%s:%s', host, port)
})
