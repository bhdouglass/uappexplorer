var db = require('../db/db');
var rss = require('rss');
var _ = require('lodash');

var typeMap = {
  application: 'App',
  scope: 'Scope',
  webapp: 'Web App',
  snappy: 'Snappy App',
};

function type(types) {
  var t = 'application';
  if (types.indexOf('application')) {
    t = 'application';
  }
  else if (types.indexOf('webapp')) {
    t = 'webapp';
  }
  else if (types.length > 0) {
    t = types[0];
  }

  return typeMap[t];
}

function generateFeed(callback) {
  var feed = new rss({
    title:       'uApp Explorer New Apps',
    description: 'New apps in the uApp Explorer',
    feed_url:    'https://uappexplorer.com/api/rss/new-apps.xml',
    site_url:    'https://uappexplorer.com/',
    image_url:   'https://uappexplorer.com/img/app-logo.png',
    ttl:         240 //4 hours
  });

  var query = db.Package.find();
  query.limit(10);
  query.sort('-published_date');
  query.exec(function(err, pkgs) {
    if (err) {
      callback(err);
    }
    else {
      _.forEach(pkgs, function(pkg) {
        feed.item({
          title:       'New ' + type(pkg.types) + ': ' + pkg.title,
          url:         'https://uappexplorer.com/app/' + pkg.name,
          description: '<a href="https://uappexplorer.com/app/' + pkg.name + '"><img src="https://uappexplorer.com/api/icon/' + pkg.name + '.png" /></a><br/>' + pkg.description,
          author:      pkg.author,
          date:        pkg.last_updated,
        });
      });

      callback(null, feed.xml({indent: true}));
    }
  });
}

function setup(app, success, error) {
  app.get('/api/rss/new-apps.xml', function(req, res) {
    generateFeed(function(err, f) {
      if (err) {
        error(res, err);
      }
      else {
        res.header('Content-Type', 'text/xml');
        res.send(f);
      }
    });
  });
}

exports.setup = setup;
