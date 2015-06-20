var mongoose = require('mongoose');

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

exports.Package = Package;