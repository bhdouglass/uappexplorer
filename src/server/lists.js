var db = require('../db');
var passport = require('passport');
var _ = require('lodash');

function setup(app, success, error) {
    app.get('/api/lists', function(req, res) {
        var query = {};
        if (req.body.user) {
            query.user = req.body.user;
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

    app.post('/api/lists', passport.authenticate('basic', {session: false}), function(req, res) {
        var list = new db.List();
        list.user = req.user._id;
        list.user_name = req.user.name;
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

    app.put('/api/lists/:id', passport.authenticate('basic', {session: false}), function(req, res) {
        db.List.findOne({_id: req.params.id}, function(err, list) {
            if (err) {
                error(res, err);
            }
            else if (!list) {
                error(res, 'List not found', 404);
            }
            else {
                var updates = {
                    user_name: req.user.name ? req.user.name : null,
                    name: req.body.name ? req.body.name : null,
                    sort: req.body.sort ? req.body.sort : null,
                    packages: _.isArray(req.body.packages) ? req.body.packages : null
                };

                _.forEach(updates, function(update, key) {
                    if (update !== null) {
                        list[key] = update;
                    }
                });

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

    app.delete('/api/lists/:id', passport.authenticate('basic', {session: false}), function(req, res) {
        db.List.findOne({_id: req.params.id}, function(err, list) {
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
