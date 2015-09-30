var package = require('./package');
var config = require('../config');
var db = require('../db/db');
var logger = require('../logger');
var request = require('request');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');

//Maths from:
//http://fulmicoton.com/posts/bayesian_rating/
//http://www.frontendjunkie.com/2011/02/using-bayesian-average-to-rank-content.html
function calculateBayesianAverages(callback) {
  db.Package.find({}, function(err, packages) {
    if (err) {
      callback(err);
    }
    else {
      var total_num_reviews = 0;
      var total_rating = 0;
      var total_packages = 0;
      _.forEach(packages, function(pkg) {
        if (pkg.num_reviews > 0) { //Don't count unreviewed apps
          total_num_reviews += pkg.num_reviews;
          total_rating += pkg.average_rating;
          total_packages++;
        }
      });

      var total_average_rating = total_rating / total_packages;
      var average_num_reviews = total_num_reviews / total_packages;

      async.each(packages, function(pkg, cb) {
        if (pkg.num_reviews > 0) {
          pkg.bayesian_average = ((average_num_reviews * total_average_rating) + pkg.total_rating) / (average_num_reviews + pkg.num_reviews);
        }
        else {
          pkg.bayesian_average = 0;
        }

        pkg.save(function(err) {
          if (err) {
            cb(err);
          }
          else {
            cb(null);
          }
        });

      }, callback);
    }
  });
}

function calculateRatings(pkg, reviews) {
  var points = 0;
  var total_rating = 0;
  var monthly_popularity = 0;
  _.forEach(reviews, function(review) {
    total_rating += review.rating;

    if (review.rating == 1) {
      points -= 1;
    }
    else if (review.rating == 2) {
      points -= 0.5;
    }
    else if (review.rating == 4) {
      points += 0.5;
    }
    else if (review.rating == 5) {
      points += 1;
    }

    var reviewDate = moment(review.date_created);
    var now = moment();
    if (review.rating >= 4 && reviewDate.month() == now.month() && reviewDate.year() == now.year()) {
      monthly_popularity++;
    }
  });

  pkg.points = Math.round(points);
  pkg.num_reviews = reviews.length;
  pkg.total_rating = total_rating;
  pkg.monthly_popularity = monthly_popularity;
  if (total_rating === 0 || reviews.length === 0) {
    pkg.average_rating = 0;
  }
  else {
    pkg.average_rating = total_rating / reviews.length;
  }
}

function refreshRatings(callback) {
  db.Package.find({}, function(err, packages) {
    if (err) {
      callback(err);
    }
    else {
      async.eachSeries(packages, function(pkg, callback) {
        db.Review.findOne({name: pkg.name}, function(err, rev) {
          if (err) {
            callback(err);
          }
          else if (rev) {
            calculateRatings(pkg, rev.reviews);

            async.series([
              function(cb) {
                rev.save(function(err) {
                  if (err) {
                    cb(err);
                  }
                  else {
                    cb(null);
                  }
                });
              },
              function(cb) {
                pkg.save(function(err) {
                  if (err) {
                    cb(err);
                  }
                  else {
                    cb(null);
                  }
                });
              }
            ], callback);
          }
        });
      }, function(err) {
        if (err) {
          logger.error(err);
          if (callback) {
            callback(err);
          }
        }
        else {
          calculateBayesianAverages(function(err) {
            if (err) {
              logger.error(err);
            }

            if (callback) {
              callback(err);
            }
          });
        }
      });
    }
  });
}

function parseReview(pkg, callback) {
  logger.info('parsing reviews for ' + pkg.name);
  request(config.spider.reviews_api + '?package_name=' + pkg.name, function(err, resp, body) {
    if (err) {
      callback(err);
    }
    else {
      var reviews = null;
      try {
        reviews = JSON.parse(body);
      }
      catch (e) {
        console.error('Failed to parse reviews for pkg.name');
      }

      if (reviews) {
        db.Review.findOne({name: pkg.name}, function(err, rev) {
          if (err) {
            callback(err);
          }
          else {
            if (!rev) {
              rev = new db.Review();
            }

            rev.name = pkg.name;
            rev.reviews = reviews;

            calculateRatings(pkg, reviews);

            var stats = {
              5: 0,
              4: 0,
              3: 0,
              2: 0,
              1: 0,
              total: reviews.length,
            };
            _.forEach(reviews, function(review) {
              stats[review.rating]++;
            });

            rev.stats = stats;

            async.series([
              function(cb) {
                rev.save(function(err) {
                  if (err) {
                    cb(err);
                  }
                  else {
                    cb(null);
                  }
                });
              },
              function(cb) {
                pkg.save(function(err) {
                  if (err) {
                    cb(err);
                  }
                  else {
                    cb(null);
                  }
                });
              }
            ], function(err) {
              callback(err);
            });
          }
        });
      }
    }
  });
}

function parseReviews(pkgName, callback) {
  var query = {};
  if (pkgName) {
    query.name = pkgName;
  }

  db.Package.find(query, function(err, packages) {
    if (err) {
      logger.error(err);
    }
    else {
      async.eachSeries(packages, parseReview, function(err) {
        if (err) {
          logger.error(err);
          if (callback) {
            callback(err);
          }
        }
        else {
          calculateBayesianAverages(function(err) {
            if (err) {
              logger.error(err);
            }

            package.mongoToElasticsearch(null, callback);
          });
        }
      });
    }
  });
}

exports.parseReviews = parseReviews;
exports.refreshRatings = refreshRatings;
exports.calculateBayesianAverages = calculateBayesianAverages;
