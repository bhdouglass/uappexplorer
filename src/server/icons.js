var db = require('../db');
var config = require('../config');
var utils = require('../utils');
var moment = require('moment');
var fs = require('fs');
var mime = require('mime');

function setup(app, success, error) {
  app.get('/api/icon/:name', function(req, res) {
    var name = req.params.name;
    if (name.indexOf('.png') == (name.length - 4)) {
      name = name.replace('.png', '');
    }

    db.Package.findOne({name: name}, function(err, pkg) {
      if (err) {
        error(res, err);
      }
      else if (!pkg) {
        res.status(404);
        fs.createReadStream(__dirname + config.server.static + '/img/404.png').pipe(res);
      }
      else {
        if (pkg.icon) {
          if (!pkg.icon_filename) {
            pkg.icon_filename = pkg.icon.replace('https://', '').replace('http://', '').replace(/\//g, '-');
          }

          var now = moment();
          var filename = config.data_dir + '/' + pkg.icon_filename;
          fs.exists(filename, function(exists) {
            if (exists && now.diff(pkg.icon_fetch_date, 'days') <= 2) {
              res.setHeader('Content-type', mime.lookup(filename));
              res.setHeader('Cache-Control', 'public, max-age=172800'); //2 days
              fs.createReadStream(filename).pipe(res);
            }
            else {
              utils.download(pkg.icon, filename, function(err) {
                if (err) {
                  res.status(500);
                  fs.createReadStream(__dirname + config.server.static + '/img/404.png').pipe(res);
                }
                else {
                  pkg.icon_fetch_date = now.valueOf();

                  res.setHeader('Content-type', mime.lookup(filename));
                  res.setHeader('Cache-Control', 'public, max-age=172800'); //2 days
                  fs.createReadStream(filename).pipe(res);
                }
              });
            }
          });
        }
        else {
          res.status(404);
          fs.createReadStream(__dirname + config.server.static + '/img/404.png').pipe(res);
        }
      }
    });
  });
}

exports.setup = setup;
