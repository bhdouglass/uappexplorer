var db = require('../db');
var rss = require('rss');
var _ = require('lodash');

function generateFeed(callback) {
  var feed = new rss({
    title:       'uApp Explorer New Apps',
    description: 'New apps in the Ubuntu Touch appstore',
    feed_url:    'https://uappexplorer.com/api/rss/new-apps.xml',
    site_url:    'https://uappexplorer.com/',
    image_url:   'https://uappexplorer.com/img/ubuntu-logo.png',
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
          title:       pkg.title,
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
