var Department = require('./department').Department;
var List = require('./list').List;
var Package = require('./package').Package;
var Review = require('./review').Review;
var User = require('./user').User;
var Wish = require('./wish').Wish;
var config = require('../config');
var logger = require('../logger');
var mongoose = require('mongoose');

mongoose.connect(config.mongo.uri + config.mongo.database, function(err) {
  if (err) {
    logger.error('database: ' + err);
    process.exit(1);
  }
});

exports.Department = Department;
exports.List = List;
exports.Package = Package;
exports.Review = Review;
exports.User = User;
exports.Wish = Wish;
