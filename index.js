var express = require('express')
var spider = require('./api/spider')

var server_port = process.env.OPENSHIFT_NODEJS_PORT || process.env.NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || process.env.NODEJS_IP || '127.0.0.1'
var app = express()

app.get('/', function (req, res) {
  res.send('Ubuntu Appstore!')
})

spider.packageList()

var server = app.listen(server_port, server_ip_address, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('Listening at http://%s:%s', host, port)
})
