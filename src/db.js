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
  categories: [String],
  changelog: String,
  cloudinary_url: String,
  company: String,
  description: String,
  download: String,
  filesize: String,
  framework: [String],
  icon: String,
  icon_fetch_date: Number,
  icon_filename: String,
  icons: {},
  keywords: [String],
  last_updated: String,
  license: String,
  name: {type: String, index: true},
  points: Number,
  prices: {},
  published_date: String,
  screenshot: String,
  screenshots: [String],
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
});

var Package = mongoose.model('Package', packageSchema);

var departmentSchema = mongoose.Schema({
  name: String,
  internal_name: {type: String, index: true},
  url: String,
});

var Department = mongoose.model('Department', departmentSchema);

var reviewSchema = mongoose.Schema({
  name: String,
  reviews: [{}],
});

var Review = mongoose.model('Review', reviewSchema);

exports.Package = Package;
exports.Department = Department;
exports.Review = Review;
