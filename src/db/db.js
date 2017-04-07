var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var Department = require('./department').Department;
var List = require('./list').List;
var Package = require('./package').Package;
var Review = require('./review').Review;
var User = require('./user').User;
var Wish = require('./wish').Wish;
var config = require('../config');
var logger = require('../logger');

//As recommended here: https://blog.mlab.com/2014/04/mongodb-driver-mongoose/
var options = {
  server: {
    socketOptions: {
      keepAlive: 300000,
      connectTimeoutMS: 30000
    }
  },
  replset: {
    socketOptions: {
      keepAlive: 300000,
      connectTimeoutMS : 30000
    }
  }
};

mongoose.connect(config.mongo.uri + '/' + config.mongo.database, options, function(err) {
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
