var fs = require('fs')
var path = require('path')
var _ = require('lodash')

//Override defaults with a config.json file in the same directory as this file
//Override defaults and config.json with env variables

var config = {
  data_dir: '/tmp',
  server: {
    ip: '127.0.0.1',
    port: 8080,
  },
  mongo: {
    uri: 'mongodb://localhost/',
    database: 'appstore',
  },
  spider: {
    search_api: 'https://search.apps.ubuntu.com/api/v1/search',
    reviews_api: 'https://reviews.ubuntu.com/click/api/1.0/reviews/',
    departments_api: 'https://search.apps.ubuntu.com/api/v1/departments',
    packages_api: 'https://search.apps.ubuntu.com/api/v1/package/',
  },
  logentries: {
    token: ''
  }
}

if (fs.existsSync(path.join(__dirname, 'config.json'))) {
  var config_file = fs.readFileSync(path.join(__dirname, 'config.json'))
  _.extend(config, JSON.parse(config_file))
}

if (process.env.OPENSHIFT_DATA_DIR) {
  config.data_dir = process.env.OPENSHIFT_DATA_DIR
}
else if (process.env.DATA_DIR) {
  config.data_dir = process.env.DATA_DIR
}

if (process.env.OPENSHIFT_NODEJS_IP) {
  config.server.ip = process.env.OPENSHIFT_NODEJS_IP
}
else if (process.env.NODEJS_IP) {
  config.server.ip = process.env.NODEJS_IP
}

if (process.env.OPENSHIFT_NODEJS_PORT) {
  config.server.port = process.env.OPENSHIFT_NODEJS_PORT
}
else if (process.env.NODEJS_PORT) {
  config.server.port = process.env.NODEJS_PORT
}

if (process.env.OPENSHIFT_MONGODB_DB_URL) {
  config.mongo.uri = process.env.OPENSHIFT_MONGODB_DB_URL
}
else if (process.env.MONGODB_URI) {
  config.mongo.uri = process.env.MONGODB_URI
}

if (process.env.MONGODB_DB) {
  config.mongo.database = process.env.MONGODB_DB
}

if (process.env.LOGENTRIES_TOKEN) {
  config.logentries.token = process.env.LOGENTRIES_TOKEN
}

module.exports = config
