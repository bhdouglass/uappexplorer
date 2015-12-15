var mongoose = require('mongoose');

var wishSchema = mongoose.Schema({
  amazon_link: String,
  developer: String,
  downvotes: Number,
  existing: Boolean,
  google_play_link: String,
  itunes_link: String,
  name: String,
  other_link: String,
  upvotes: Number,
  voters: {},
  wisher: String,
});

var Wish = mongoose.model('Wish', wishSchema);

exports.Wish = Wish;
