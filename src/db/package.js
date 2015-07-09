var config = require('../config');
var logger = require('../logger');
var mongoose = require('mongoose');
var elasticsearch = require('elasticsearch');

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
  webapp_inject: Boolean,
  website: String,
  //TODO handle translations
});

packageSchema.post('save', function(pkg) {
  logger.debug(pkg.name + ' saved to mongo');
  var client = new elasticsearch.Client({host: config.elasticsearch.uri});

  pkg = JSON.parse(JSON.stringify(pkg));
  delete pkg.__v;
  delete pkg._id;

  client.update({
    index: 'packages',
    type: 'package',
    id: pkg.name,
    retryOnConflict: 3,
    body: {
      doc: pkg,
      doc_as_upsert: true,
    },
  },
  function(err, res) {
    if (err) {
      logger.error(pkg.name + ' failed to save: ' + err);
      logger.error(res);
    }
    else {
      logger.debug(pkg.name + ' saved to elasticsearch');
    }
  });
});

packageSchema.index({
  title: 'text',
  description: 'text',
  keywords: 'text',
  author: 'text',
  company: 'text',
},
{
  weights: {
    title: 10,
    description: 5,
    keywords: 3,
    author: 1,
    company: 1,
  },
  name: 'searchIndex',
});

var Package = mongoose.model('Package', packageSchema);

exports.Package = Package;
