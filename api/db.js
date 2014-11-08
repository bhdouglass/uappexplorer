var mongoose = require('mongoose');

var host = process.env.OPENSHIFT_MONGODB_DB_HOST || process.env.MONGODB_HOST || 'localhost'
var port = process.env.OPENSHIFT_MONGODB_DB_PORT || process.env.MONGODB_PORT || 27017
var database = process.env.MONGODB_DB || 'appstore'
var options = {}

if (process.env.OPENSHIFT_MONGODB_DB_HOST) {
  options.user = 'admin'
  options.pass = 'aGH5xLNHd_gh'
}

mongoose.connect('mongodb://' + host + ':' + port + '/' + database, function(err, res) {
  if (err) {
    console.log('Error connecting to mongo: ' + err);
  }
  else {
    console.log('Connected to mongo');
  }
});

var packageSchema = mongoose.Schema({
  architecture: [String],
  author: String,
  average_rating: Number,
  categories: [String],
  changelog: String,
  company: String,
  description: String,
  download: String,
  filesize: String,
  framework: [String],
  icon: String,
  icon_filename: String,
  icons: {},
  keywords: [String],
  last_updated: String,
  license: String,
  name: {type: String, index: true},
  prices: {},
  published_date: String,
  screenshot: String,
  screenshots: String,
  status: String,
  support: String,
  terms: String,
  title: String,
  type: String,
  url: String,
  version: String,
  videos: [String],
  website: String,
  //TODO handle translations
})

var Package = mongoose.model('Package', packageSchema)

exports.Package = Package