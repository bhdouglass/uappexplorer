var config = require('../config');
var db = require('../db/db');
var elasticsearchPackage = require('../db/elasticsearchPackage');
var logger = require('../logger');
var request = require('request');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');

//Calculate heart rating, monthly popularity, and average stars
function calculateRatings(pkg, reviews) {
  var points = 0; //Heart rating
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

//Maths from:
//http://fulmicoton.com/posts/bayesian_rating/
//http://www.frontendjunkie.com/2011/02/using-bayesian-average-to-rank-content.html
function refreshRatings(callback) {
  db.Package.find({}, function(err, packages) {
    if (err) {
      callback(err);
    }
    else {
      db.Review.find({}, function(err, reviews) {
        if (err) {
          callback(err);
        }
        else {
          //Map the reviews by package name for easy access
          var reviewMap = {};
          _.forEach(reviews, function(review) {
            reviewMap[review.name] = review;
          });

          var total_num_reviews = 0;
          var total_all_rating = 0;
          var total_packages = 0;
          _.forEach(packages, function(pkg) {
            logger.debug('reviews - ' + pkg.name);
            if (reviewMap[pkg.name]) {
              calculateRatings(pkg, reviewMap[pkg.name].reviews);
            }

            //Sum everything for bayesian average
            if (pkg.num_reviews > 0) { //Don't count unreviewed apps
              total_num_reviews += pkg.num_reviews;
              total_all_rating += pkg.average_rating;
              total_packages++;
            }
          });

          var total_average_rating = total_all_rating / total_packages;
          var average_num_reviews = total_num_reviews / total_packages;
          async.each(packages, function(pkg, cb) {
            //Calculate bayesian average for each app
            if (pkg.num_reviews > 0) {
              pkg.bayesian_average = ((average_num_reviews * total_average_rating) + pkg.total_rating) / (average_num_reviews + pkg.num_reviews);
            }
            else {
              pkg.bayesian_average = 0;
            }

            logger.debug('save - ' + pkg.name);
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
  });
}

function parseReview(pkg, callback) {
  logger.debug('parsing reviews for ' + pkg.name);
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

function parseReviews(pkgName, page, pages, callback) {
  var query = {};
  if (pkgName) {
    query.name = pkgName;
  }

  db.Package.count(query, function(err, count) {
    if (err) {
      logger.error(err);
      if (callback) {
        callback(err);
      }
    }
    else {
      var q = db.Package.find(query);

      if (page !== undefined && pages !== undefined && page !== null && pages !== null) {
        var limit = Math.ceil(count / pages);
        var skip = limit * page;

        q.limit(limit).skip(skip);
      }

      q.exec(function(err, packages) {
        if (err) {
          logger.error(err);
          if (callback) {
            callback(err);
          }
        }
        else {
          logger.info('Going parse ' + packages.length + ' package reviews');

          var tasks = [];
          packages.forEach(function(pkg) {
            tasks.push(function(cb) {
              parseReview(pkg, cb);
            });
          });

          async.parallelLimit(tasks, 10, function(err) {
            if (err) {
              logger.error(err);
              if (callback) {
                callback(err);
              }
            }
            else {
              logger.info('Finished parsing reviews, going to refresh ratings');
              refreshRatings(function(err) {
                if (err) {
                  logger.error(err);
                  if (callback) {
                    callback(err);
                  }
                }

                logger.info('Finished refreshing reviews');
                elasticsearchPackage.mongoToElasticsearch(null, callback);
              });
            }
          });
        }
      });
    }
  });
}

exports.parseReviews = parseReviews;
exports.refreshRatings = refreshRatings;
