var mongoose = require('mongoose');

function connect(callback) {
  mongoose.connect('mongodb://localhost/appstore');

  var db = mongoose.connection
  db.on('error', function(err) {
    console.error(err)
  })

  db.on('open', function() {
    var packageSchema = mongoose.Schema({
      name: {type: [String], index: true},
      title: String,
      author: String,
      icon: String,
      icons: {},
      type: String,
      architecture: [String],
      prices: {},
      status: String,
      last_updated: String,
      keywords: [String],
      videos: [String],
      screenshot: String,
      screenshots: String,
      support: String,
      filesize: Number,
      version: String,
      company: String,
      terms: String,
      tos_url: String,
      website: String,
      description: String,
      frameworks: [String],
      license: String,
      published_date: String,
      changelog: String,
      average_rating: Number,
      download: String
    })

    var Package = mongoose.model('Package', packageSchema)

    callback(Package)
  });
}

exports.connect = connect
