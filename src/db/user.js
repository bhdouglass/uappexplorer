var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  apikey: String,
  apisecret: String,
  caxton_token: String,
  email: String,
  language: String, //language from ubuntu
  name: String,
  selectedLanguage: String, //user selected language from interface
  ubuntu_id: {type: String, index: true},
  username: String,
});

var User = mongoose.model('User', userSchema);

exports.User = User;
