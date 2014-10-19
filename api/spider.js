var https = require('https')
var _ = require('lodash')
var db = require('./db')

function parsePackageList(list) {
  db.connect(function(Package) {
    _.forEach(list, function(pkg) {
      Package.find({name: pkg.name}, function(err, packages) {

        p = null;
        if (err) {
          console.error(err);
        }
        else if (packages.length == 0) {
          p = new Package();
          console.log('Creating new');
        }
        else {
          p = packages[0];
          console.log('Found existing');
        }

        p.name = pkg.name
        p.title = pkg.title
        p.author = pkg.publisher
        p.icon = pkg.icon_url.replace('\\', '')
        p.type = pkg.content
        p.average_rating = pkg.ratings_average
        p.architecture = pkg.architecture
        p.prices = pkg.prices
        p.save(function(err, p) {
          if (err) {
            console.error(err)
          }
        })
      })
    })
  })
}

function packageList() {
  https.get('https://search.apps.ubuntu.com/api/v1/search', function(res) {
    var data = '';

    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      data += chunk;
    })

    res.on('end', function() {
      data = JSON.parse(data)
      parsePackageList(data['_embedded']['clickindex:package']);
    })

  }).on('error', function(e) {
    console.log('Got error: ' + e.message)
  })
}

exports.packageList = packageList
