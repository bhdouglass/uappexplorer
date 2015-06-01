var mongoose = require('mongoose');

var listSchema = mongoose.Schema({
  name: String,
  packages: [String],
  sort: String,
  user_name: String,
  user: {type: String, index: true},
});

var List = mongoose.model('List', listSchema);

exports.List = List;
