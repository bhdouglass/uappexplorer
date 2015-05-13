var UbuntuStrategy = require('./ubuntuStrategy').Strategy;
var config = require('../config');
var db = require('../db');
var passport = require('passport');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var session = require('cookie-session');

function setup(app) {
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
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
            user.ubuntu_id = identifier;
            user.username = Math.random();
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
            console.log('lang');
          }

          if (save) {
            console.log('saving user', user);
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
    successRedirect: '/auth/me',
    failureRedirect: '/auth/login'
  }));

  app.get('/auth/login', function(req, res) {
    res.send('<h1>This feature is not yet available, go browse some apps!</h1><form action="/auth/ubuntu" method="post"><div><input type="submit" value="Sign In"/></div></form>');
  });

  app.get('/auth/me', function(req, res) {
    res.send(req.user);
  });

  app.get('/auth/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
}

exports.setup = setup;
