var fs = require('fs');
var path = require('path');
var _ = require('lodash');

//Override defaults with a config.json file in the same directory as this file
//Override defaults and config.json with env variables

var config = {
  data_dir: '/tmp',
  capabilities: ['spider', 'app', 'api', 'icons', 'feed'],
  use_spider: function() {
    return (config.capabilities.indexOf('spider') > -1);
  },
  use_app: function() {
    return (config.capabilities.indexOf('app') > -1);
  },
  use_api: function() {
    return (config.capabilities.indexOf('api') > -1);
  },
  use_icons: function() {
    return (config.capabilities.indexOf('icons') > -1);
  },
  use_feed: function() {
    return (config.capabilities.indexOf('feed') > -1);
  },
  use_cloudinary: function() {
    return !!config.cloudinary.api_key;
  },
  server: {
    ip: '0.0.0.0',
    port: 8080,
    host: 'https://uappexplorer.com',
    static: '/static',
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
  papertrail: {
    host: '',
    port: null
  },
  cloudinary: {
    cloud_name: '',
    api_key: '',
    api_secret: '',
  }
};

if (fs.existsSync(path.join(__dirname, 'config.json'))) {
  var config_file = fs.readFileSync(path.join(__dirname, 'config.json'));
  _.extend(config, JSON.parse(config_file));
}

if (process.env.OPENSHIFT_DATA_DIR) {
  config.data_dir = process.env.OPENSHIFT_DATA_DIR;
}
else if (process.env.DATA_DIR) {
  config.data_dir = process.env.DATA_DIR;
}

if (process.env.OPENSHIFT_NODEJS_IP) {
  config.server.ip = process.env.OPENSHIFT_NODEJS_IP;
}
else if (process.env.NODEJS_IP) {
  config.server.ip = process.env.NODEJS_IP;
}

if (process.env.OPENSHIFT_NODEJS_PORT) {
  config.server.port = process.env.OPENSHIFT_NODEJS_PORT;
}
else if (process.env.NODEJS_PORT) {
  config.server.port = process.env.NODEJS_PORT;
}

if (process.env.NODEJS_STATIC) {
  config.server.static = process.env.NODEJS_STATIC;
}

if (process.env.NODEJS_NO_SPIDER == 1) {
  config.capabilities.splice(config.capabilities.indexOf('spider'), 1);
}

if (process.env.NODEJS_SPIDER_ONLY == 1) {
  config.capabilities.splice(config.capabilities.indexOf('api'), 1);
  config.capabilities.splice(config.capabilities.indexOf('app'), 1);
}

if (process.env.NODEJS_NO_ICONS == 1) {
  config.capabilities.splice(config.capabilities.indexOf('icons'), 1);
}

if (process.env.OPENSHIFT_MONGODB_DB_URL) {
  config.mongo.uri = process.env.OPENSHIFT_MONGODB_DB_URL;
}
else if (process.env.MONGODB_URI) {
  config.mongo.uri = process.env.MONGODB_URI;
}
else if (process.env.MONGO_PORT) { //From docker
  config.mongo.uri = process.env.MONGO_PORT.replace('tcp', 'mongodb');
}

if (process.env.MONGODB_DB) {
  config.mongo.database = process.env.MONGODB_DB;
}

if (process.env.PAPERTRAIL_HOST) {
  config.papertrail.host = process.env.PAPERTRAIL_HOST;
}

if (process.env.PAPERTRAIL_PORT) {
  config.papertrail.port = process.env.PAPERTRAIL_PORT;
}

if (process.env.CLOUDINARY_NAME) {
  config.cloudinary.cloud_name = process.env.CLOUDINARY_NAME;
}

if (process.env.CLOUDINARY_KEY) {
  config.cloudinary.api_key = process.env.CLOUDINARY_KEY;
}

if (process.env.CLOUDINARY_SECRET) {
  config.cloudinary.api_secret = process.env.CLOUDINARY_SECRET;
}

module.exports = config;
