var db = require('../db/db');
var _ = require('lodash');

function setup(app, success, error, isAuthenticated) {
  app.get('/api/lists', function(req, res) {
    var query = {};
    if (req.query.user) {
      query.user = req.query.user;
    }

    db.List.find(query, function(err, lists) {
      if (err) {
       error(res, err);
      }
      else {
        if (!lists) {
          lists = [];
        }

        success(res, lists);
      }
    });
  });

  app.get('/api/lists/:id', function(req, res) {
    db.List.findOne({_id: req.params.id}, function(err, list) {
      if (err) {
        error(res, err);
      }
      else if (!list) {
        error(res, 'List not found', 404);
      }
      else {
        success(res, list);
      }
    });
  });

  app.post('/api/lists', isAuthenticated, function(req, res) {
    var list = new db.List();
    list.user = req.user._id;
    list.user_name = req.user.username;
    list.name = req.body.name;
    list.sort = req.body.sort;
    list.packages = _.isArray(req.body.packages) ? req.body.packages : [];

    list.save(function(err) {
      if (err) {
        error(res, err);
      }
      else {
        success(res, list);
      }
    });
  });

  app.put('/api/lists/:id', isAuthenticated, function(req, res) {
    db.List.findOne({_id: req.params.id, user: req.user._id}, function(err, list) {
      if (err) {
        error(res, err);
      }
      else if (!list) {
        error(res, 'List not found', 404);
      }
      else {
        var updates = {
          user_name: req.user.username ? req.user.username : null,
          name: req.body.name ? req.body.name : null,
          sort: req.body.sort ? req.body.sort : null,
          packages: _.isArray(req.body.packages) ? req.body.packages : null
        };

        _.forEach(updates, function(update, key) {
          if (update !== null) {
            list[key] = update;
          }
        });

        if (req.body.append_package) {
          list.packages.push(req.body.append_package);
        }

        if (req.body.remove_package) {
          var index = list.packages.indexOf(req.body.remove_package);
          if (index > -1) {
            list.packages.splice(index, 1);
          }
        }

        list.save(function(err) {
          if (err) {
            error(res, err);
          }
          else {
            success(res, list);
          }
        });
      }
    });
  });

  app.delete('/api/lists/:id', isAuthenticated, function(req, res) {
    db.List.findOne({_id: req.params.id, user: req.user._id}, function(err, list) {
      if (err) {
        error(res, err);
      }
      else if (!list) {
        error(res, 'List not found', 404);
      }
      else {
        db.List.remove({_id: req.params.id}, function(err) {
          if (err) {
            error(res, err);
          }
          else {
            success(res, null);
          }
        });
      }
    });
  });
}

exports.setup = setup;
