var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/appstore', function (err, res) {
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
