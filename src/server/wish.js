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
    upvotes: wish.upvotes,
    voted: false,
    wisher: wish.wisher,
  };

  if (user && user._id && wish.voters && wish.voters[user._id]) {
    jwish.voted = wish.voters[user._id].direction;
  }

  return jwish;
}

function setup(app, success, error, isAuthenticated) {
  //TODO sorting & filtering & paging
  app.get(['/api/wish', '/api/wish/:id'], function(req, res) {
    var query = {};
    if (req.params.id) {
      query._id = req.params.id;
    }

    db.Wish.find(query, function(err, wishes) {
      if (err) {
        error(res, err);
      }
      else {
        var json = [];
        _.forEach(wishes, function(wish) {
          json.push(jsonize(wish, req.user));
        });

        if (req.params.id) {
          if (json.length === 0) {
            error(res, 'Wish not found with given id', 404);
          }
          else {
            json = json[0];
          }
        }

        success(res, json);
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
          wish.voters = {};
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
      else if (!wishes) {
        error(res, 'Wish not found with given id', 404);
      }
      else {
        var set = {};
        set['votes.' + req.user._id] = {
          direction: req.body.direction,
          app_price: req.body.app_price ? req.body.app_price : 0,
          dev_price: req.body.dev_price ? req.body.dev_price : 0,
        };

        var inc = {};
        inc[(req.body.direction == 'up') ? 'upvotes' : 'downvotes'] = 1;

        db.Wish.update({_id: req.params.id}, {$set: set, $inc: inc}, function(err) {
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
  });
}

exports.setup = setup;
