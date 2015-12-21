var db = require('../db/db');
var _ = require('lodash');
var validUrl = require('valid-url');

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
        jwish.price += voter.price;
        count++;
      }
    });

    jwish.price /= count;
  }

  if (user && user._id && wish.votes && wish.votes[user._id]) {
    jwish.voted = wish.votes[user._id].direction;
  }

  return jwish;
}

function setup(app, success, error, isAuthenticated) {
  app.get('/api/wish/:id', function(req, res) {
    db.Wish.findOne({_id: req.params.id}).sort('-upvotes').exec(function(err, wish) {
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

        query.sort('-upvotes').exec(function(err, wishes) {
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
        req.body.google_play_link = req.body.google_play_link ? 'http://' + req.body.google_play_link.replace(/http:\/\//i, '').replace(/https:\/\//i, '') : '';
        req.body.itunes_link = req.body.itunes_link ? 'http://' + req.body.itunes_link.replace(/http:\/\//i, '').replace(/https:\/\//i, '') : '';
        req.body.other_link = req.body.other_link ? 'http://' + req.body.other_link.replace(/http:\/\//i, '').replace(/https:\/\//i, '') : '';

        if (req.body.amazon_link && !validUrl.isWebUri(req.body.amazon_link)) {
          error(res, 'Amazon link is not a valid url', 421);
        }
        else if (req.body.google_play_link && !validUrl.isWebUri(req.body.google_play_link)) {
          error(res, 'Google Play link is not a valid url', 422);
        }
        else if (req.body.itunes_link && !validUrl.isWebUri(req.body.itunes_link)) {
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
          price: req.body.price ? req.body.price : 0,
        };

        var inc = {};
        if (req.body.direction == 'up') {
          inc['upvotes'] = 1;
        }
        else {
          inc['downvotes'] = 1;
        }

        //User already voted, update to use their latest vote
        if (wish.votes && wish.votes[req.user._id]) {
          if (req.body.direction == 'up') {
            inc['downvotes'] = -1;
          }
          else {
            inc['upvotes'] = -1;
          }
        }

        db.Wish.update({_id: req.params.id}, {$set: set}, function(err) {
          if (err) {
            error(res, err);
          }
          else {
            db.Wish.update({_id: req.params.id}, {$inc: inc}, function(err) {
              if (err) {
                error(res, err);
              }
              else {
                var json = jsonize(wish);
                json.voted = req.body.direction;

                success(res, json);
              }
            });
          }
        });
      }
    });
  });
}

exports.setup = setup;
