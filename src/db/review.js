var mongoose = require('mongoose');

var reviewSchema = mongoose.Schema({
  name: {type: String, index: true},
  reviews: [{}],
  stats: {},
});

var Review = mongoose.model('Review', reviewSchema);

exports.Review = Review;
