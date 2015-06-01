var mongoose = require('mongoose');

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

exports.User = User;
