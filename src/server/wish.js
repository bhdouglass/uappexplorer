var db = require('../db/db');
var _ = require('lodash');
var validUrl = require('valid-url');
var async = require('async');

function jsonize(wish, user) {
  var jwish = {
    amazon_link: wish.amazon_link,
    developer: wish.developer,
    downvotes: wish.downvotes,
    existing: wish.existing,
    google_play_link: wish.google_play_link,
    id: wish.id,
    itunes_link: wish.itunes_link,
    name: wish.name,
    other_link: wish.other_link,
    price: 0,
    upvotes: wish.upvotes,
    voted: false,
    wisher: wish.wisher,
  };

  if (wish.votes) {
    var count = 0;
    _.forEach(wish.votes, function(voter) {
      if (voter.price >= 0) {
        jwish.price += parseFloat(voter.price);
        count++;
      }
    });

    jwish.price /= count;
  }

  jwish.price = jwish.price.toFixed(2);

  if (user && user._id && wish.votes && wish.votes[user._id]) {
    jwish.voted = wish.votes[user._id].direction;
  }

  return jwish;
}

function setup(app, success, error, isAuthenticated) {
  app.get('/api/wish/:id', function(req, res) {
    db.Wish.findOne({_id: req.params.id}).exec(function(err, wish) {
      if (err) {
        error(res, err);
      }
      else if (!wish) {
        error(res, 'Wish not found with given id', 404);
      }
      else {
        success(res, jsonize(wish, req.user));
      }
    });
  });

  app.get('/api/wish', function(req, res) {
    db.Wish.count({}).exec(function(err, count) {
      if (err) {
        error(res, err);
      }
      else {
        var query = db.Wish.find({});
        if (req.query.limit) {
          query.limit(req.query.limit);
        }

        if (req.query.skip) {
          query.skip(req.query.skip);
        }

        query.sort('-upvotes name').exec(function(err, wishes) {
          if (err) {
            error(res, err);
          }
          else {
            var json = [];
            _.forEach(wishes, function(wish) {
              json.push(jsonize(wish, req.user));
            });

            success(res, {
              count: count,
              wishes: json,
            });
          }
        });
      }
    });
  });

  app.post('/api/wish', isAuthenticated, function(req, res) {
    db.Wish.find({name: req.body.name}, function(err, wishes) {
      if (err) {
        error(res, err);
      }
      else if (wishes.length > 0) {
        error(res, 'A wish with the same name already exists', 420);
      }
      else {
        //TODO add domain validation
        req.body.amazon_link = req.body.amazon_link ? 'http://' + req.body.amazon_link.replace(/http:\/\//i, '').replace(/https:\/\//i, '') : '';
        req.body.google_play_link = req.body.google_play_link ? 'https://' + req.body.google_play_link.replace(/http:\/\//i, '').replace(/https:\/\//i, '') : '';
        req.body.itunes_link = req.body.itunes_link ? 'https://' + req.body.itunes_link.replace(/http:\/\//i, '').replace(/https:\/\//i, '') : '';
        req.body.other_link = req.body.other_link ? 'http://' + req.body.other_link.replace(/http:\/\//i, '').replace(/https:\/\//i, '') : '';

        if (
          req.body.amazon_link && (
            !validUrl.isWebUri(req.body.amazon_link) ||
            req.body.amazon_link.indexOf('http://www.amazon.com') !== 0
          )
        ) {
          error(res, 'Amazon link is not a valid url', 421);
        }
        else if (
          req.body.google_play_link && (
            !validUrl.isWebUri(req.body.google_play_link) ||
            req.body.google_play_link.indexOf('https://play.google.com') !== 0
          )
        ) {
          error(res, 'Google Play link is not a valid url', 422);
        }
        else if (
          req.body.itunes_link && (
            !validUrl.isWebUri(req.body.itunes_link) ||
            req.body.itunes_link.indexOf('https://itunes.apple.com') !== 0
          )
        ) {
          error(res, 'iTunes link is not a valid url', 423);
        }
        else if (req.body.other_link && !validUrl.isWebUri(req.body.other_link)) {
          error(res, 'Other link is not a valid url', 424);
        }
        else {
          var wish = new db.Wish();
          wish.amazon_link = req.body.amazon_link;
          wish.developer = req.body.developer;
          wish.downvotes = 0;
          wish.existing = req.body.existing;
          wish.google_play_link = req.body.google_play_link;
          wish.itunes_link = req.body.itunes_link;
          wish.name = req.body.name;
          wish.other_link = req.body.other_link;
          wish.upvotes = 0;
          wish.votes = {};
          wish.wisher = req.user.username;

          wish.save(function(err) {
            if (err) {
              error(res, error);
            }
            else {
              success(res, jsonize(wish, req.user));
            }
          });
        }
      }
    });
  });

  app.put('/api/wish/:id', isAuthenticated, function(req, res) {
    var price = req.body.price ? parseFloat(req.body.price) : 0;
    if (price < 0 || price > 20) {
      error(res, 'Price must be between 0 and 20 USD', 425);
    }
    else {
      db.Wish.findOne({_id: req.params.id}, function(err, wish) {
        if (err) {
          error(res, err);
        }
        else if (!wish) {
          error(res, 'Wish not found with given id', 404);
        }
        else {
          var set = {};
          set['votes.' + req.user._id] = {
            direction: req.body.direction,
            price: price,
          };

          var inc = {};
          if (req.body.direction == 'up') {
            inc.upvotes = 1;
          }
          else {
            inc.downvotes = 1;
          }

          var do_inc = true;
          if (wish.votes && wish.votes[req.user._id] && wish.votes[req.user._id].direction) {
            //User already voted make sure it's not the same
            if (wish.votes[req.user._id].direction == req.body.direction) {
              do_inc = false;
            }
            else {
              if (wish.votes[req.user._id].direction == 'up') {
                inc.upvotes = -1;
              }
              else {
                inc.downvotes = -1;
              }
            }
          }

          db.Wish.update({_id: req.params.id}, {$set: set}, function(err) {
            if (err) {
              error(res, err);
            }
            else {
              var json = jsonize(wish);
              json.voted = req.body.direction;
              if (do_inc) {
                json.upvotes += inc.upvotes ? inc.upvotes : 0;
                json.downvotes += inc.downvotes ? inc.downvotes : 0;
              }

              if (do_inc) {
                db.Wish.update({_id: req.params.id}, {$inc: inc}, function(err) {
                  if (err) {
                    error(res, err);
                  }
                  else {
                    success(res, json);
                  }
                });
              }
              else {
                success(res, json);
              }
            }
          });
        }
      });
    }
  });
}

function normalizeVotes(callback) {
  db.Wish.find({}, function(err, wishes) {
    if (err) {
      callback(err);
    }
    else {
      async.eachSeries(wishes, function(wish, cb) {
        var upvotes = 0;
        var downvotes = 0;

        if (wish.votes) {
          _.forEach(wish.votes, function(vote, key) {
            if (vote.direction == 'up') {
              upvotes++;
            }
            else {
              downvotes++;
            }

            if (vote.price) {
              vote.price = parseFloat(vote.price);
              if (vote.price < 0) {
                vote.price = 0;
              }
              else if (vote.price > 20) {
                vote.price = 20;
              }
            }
          });
        }

        wish.upvotes = upvotes;
        wish.downvotes = downvotes;
        wish.markModified('votes');

        wish.save(function(err) {
          console.log(err, 'saved: ' + wish.name);
          cb(err);
        });

      }, function(err) {
        callback(err);
      });
    }
  });
}

exports.setup = setup;
exports.normalizeVotes = normalizeVotes;
