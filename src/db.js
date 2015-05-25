var config = require('./config');
var logger = require('./logger');
var mongoose = require('mongoose');

mongoose.connect(config.mongo.uri + config.mongo.database, function(err) {
  if (err) {
    logger.error('database: ' + err);
    process.exit(1);
  }
});

var packageSchema = mongoose.Schema({
  architecture: [String],
  author: String,
  average_rating: Number,
  bayesian_average: Number,
  categories: [String],
  changelog: String,
  cloudinary_url: String,
  company: String,
  description: String,
  download: String,
  filesize: String,
  framework: [String],
  icon_fetch_date: Number,
  icon_filename: String,
  icon_hash: String,
  icon: String,
  icons: {},
  keywords: [String],
  last_updated: String,
  license: String,
  name: {type: String, index: true},
  num_reviews: Number,
  points: Number,
  prices: {},
  published_date: String,
  screenshot: String,
  screenshots: [String],
  status: String,
  support: String,
  terms: String,
  title: String,
  total_rating: Number,
  type: String,
  types: [String],
  url: String,
  version: String,
  videos: [String],
  website: String,
  //TODO handle translations
});

var Package = mongoose.model('Package', packageSchema);

var departmentSchema = mongoose.Schema({
  internal_name: {type: String, index: true},
  name: String,
  url: String,
});

var Department = mongoose.model('Department', departmentSchema);

var reviewSchema = mongoose.Schema({
  name: {type: String, index: true},
  reviews: [{}],
  stats: {},
});

var Review = mongoose.model('Review', reviewSchema);

var userSchema = mongoose.Schema({
  apikey: String,
  apisecret: String,
  email: String,
  language: String,
  name: String,
  ubuntu_id: {type: String, index: true},
  username: String,
});

var User = mongoose.model('User', userSchema);

var listSchema = mongoose.Schema({
  name: String,
  packages: [String],
  sort: String,
  user_name: String,
  user: {type: String, index: true},
});

var List = mongoose.model('List', listSchema);

exports.Package = Package;
exports.Department = Department;
exports.Review = Review;
exports.User = User;
exports.List = List;
