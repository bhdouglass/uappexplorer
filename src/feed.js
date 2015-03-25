var db = require('./db');
var feed = require('feed');
var _ = require('lodash');

function generateFeed(callback) {
  var f = new feed({
    title:       'Ubuntu Touch New Apps',
    description: 'New apps in the Ubuntu Touch appstore',
    link:        'https://appstore.bhdouglass.com/',
    image:       'https://appstore.bhdouglass.com/img/ubuntu-logo.png',
    author: {
      name:      'Brian Douglass',
      link:      'http://bhdouglass.com/'
    }
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
        f.item({
          title:       pkg.title,
          link:        'https://appstore.bhdouglass.com/app/' + pkg.name,
          description: pkg.description,
          author: [{
            name:      pkg.author,
            link:      pkg.website
          }],
          date:        new Date(pkg.last_updated),
          image:       'https://appstore.bhdouglass.com/api/icon/' + pkg.name + '.png'
        });
      });

      callback(null, f.render('rss-2.0'));
    }
  });
}

exports.generateFeed = generateFeed;
