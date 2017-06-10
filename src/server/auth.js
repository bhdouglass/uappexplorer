var config = require('../config');
var db = require('../db');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var session = require('cookie-session');
var UbuntuStrategy = require('passport-ubuntu').Strategy;
//var BasicStrategy = require('passport-http').BasicStrategy;
var uuid = require('node-uuid');
var caxton = require('caxton');

function setup(app, success, error, isAuthenticated) {
  app.use(cookieParser());
  app.use(methodOverride());
  app.use(session({
    secret: config.server.session_secret,
    name: 'ussesion',
    maxAge: 604800000 //7 days in miliseconds
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    done(null, user.ubuntu_id);
  });

  passport.deserializeUser(function(identifier, done) {
    db.User.findOne({ubuntu_id: identifier}, done);
  });

  /*passport.use(new BasicStrategy(function(apikey, apisecret, done) {
    db.User.findOne({apikey: apikey, apisecret: apisecret}, function (err, user) {
      if (err) {
        done(err);
      }
      else if (!user) {
        done(null, false);
      }
      else {
        done(null, user);
      }
    });
  }));*/

  passport.use(new UbuntuStrategy({
      returnURL: config.server.host + '/auth/ubuntu/return',
      realm: config.server.host,
      stateless: true,
    },
    function(identifier, profile, done) {
      db.User.findOne({ubuntu_id: identifier}, function(err, user) {
        if (err) {
          done(err);
        }
        else {
          var save = false;
          if (!user) {
            user = new db.User();
            user.apikey = uuid.v4();
            user.apisecret = uuid.v4();
            user.ubuntu_id = identifier;
            user.username = 'User ' + uuid.v4();
            user.language = 'en';
            save = true;
          }

          if (profile.fullname && profile.fullname != user.name) {
            user.name = profile.fullname;
            save = true;
          }

          if (profile.nickname && profile.nickname != user.username) {
            user.username = profile.nickname;
            save = true;
          }

          if (profile.email && profile.email != user.email) {
            user.email = profile.email;
            save = true;
          }

          if (profile.language && profile.language != user.language) {
            user.language = profile.language;
            save = true;
          }

          if (save) {
            user.save(function(err) {
              done(err, user);
            });
          }
          else {
            done(null, user);
          }
        }
      });
    }
  ));

  app.post('/auth/ubuntu', passport.authenticate('ubuntu'));
  app.get('/auth/ubuntu/return', passport.authenticate('ubuntu', {
    successRedirect: '/me',
    failureRedirect: '/'
  }));
  app.post('/auth/ubuntu/return', passport.authenticate('ubuntu', {
    successRedirect: '/me',
    failureRedirect: '/'
  }));

  app.get('/auth/me', function(req, res) {
    if (req.user) {
      success(res, {
        _id: req.user._id,
        apikey: req.user.apikey,
        apisecret: req.user.apisecret,
        has_caxton: !!req.user.caxton_token,
        language: req.user.language,
        name: req.user.name,
        selectedLanguage: req.user.selectedLanguage,
        username: req.user.username,
      });
    }
    else {
      error(res, 'User not logged in', 401);
    }
  });

  app.get('/auth/logout', function(req, res) {
    req.logout();
    req.session = null;
    res.redirect('/');
  });

  app.post('/auth/language/:lang', isAuthenticated, function(req, res) {
    req.user.selectedLanguage = req.params.lang;
    req.user.save(function(err) {
      if (err) {
        error(res, err);
      }
      else {
        success(res, true);
      }
    });
  });

  app.post('/auth/caxton/:code', isAuthenticated, function(req, res) {
    var appname = config.server.host.replace('http://', '').replace('https://', '');

    if (req.params.code == 'send') { //Send message
      if (!req.user.caxton_token) {
        error(res, 'No Caxton Token!', 400);
      }
      else if (!req.body.url) {
        error(res, 'No url specified!', 400);
      }
      else {
        var message = null;
        if (req.body.message) {
          message = req.body.message + ' - uApp Explorer';
        }

        caxton.send(appname, req.user.caxton_token, req.body.url, {message: message}, function(err) {
          if (err) {
            error(res, err);
          }
          else {
            success(res, true);
          }
        });
      }
    }
    else { //Request token
      caxton.token(appname, req.params.code, function(err, token) {
        if (err) {
          error(res, err, 400);
        }
        else {
          req.user.caxton_token = token;
          req.user.save(function(err) {
            if (err) {
              error(res, err);
            }
            else {
              success(res, true);
            }
          });
        }
      });
    }
  });
}

exports.setup = setup;
