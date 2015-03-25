var db = require('./db');
var rss = require('rss');
var _ = require('lodash');

function generateFeed(callback) {
  var feed = new rss({
    title:       'Ubuntu Touch New Apps',
    description: 'New apps in the Ubuntu Touch appstore',
    feed_url:    'https://appstore.bhdouglass.com/api/rss/new-apps.xml',
    site_url:    'https://appstore.bhdouglass.com/',
    image_url:   'https://appstore.bhdouglass.com/img/ubuntu-logo.png',
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
          url:         'https://appstore.bhdouglass.com/app/' + pkg.name,
          description: '<a href="https://appstore.bhdouglass.com/app/' + pkg.name + '"><img src="https://appstore.bhdouglass.com/api/icon/' + pkg.name + '.png" />' + pkg.description,
          author:      pkg.author,
          date:        pkg.last_updated,
        });
      });

      callback(null, feed.xml({indent: true}));
    }
  });
}

exports.generateFeed = generateFeed;
