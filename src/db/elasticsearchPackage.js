var config = require('../config');
var logger = require('../logger');
var elasticsearch = require('elasticsearch');

var index = 'packages';
var type = 'package';
var client = new elasticsearch.Client({host: config.elasticsearch.uri});

function upsert(pkg, callback) {
  pkg = JSON.parse(JSON.stringify(pkg));
  delete pkg.__v;
  delete pkg._id;
  pkg.raw_title = pkg.title;

  client.update({
    index: index,
    type: type,
    id: pkg.name,
    retryOnConflict: 3,
    body: {
      doc: pkg,
      doc_as_upsert: true,
    },
  },
  function(err, res) {
    if (err) {
      logger.error(pkg.name + ' failed to save: ' + err);
      logger.error(res);
    }
    else {
      logger.debug(pkg.name + ' saved to elasticsearch');
    }

    if (callback) {
      callback(err);
    }
  });
}

function remove(pkg, callback) {
  client.delete({
    index: index,
    type: type,
    id: pkg.name,
    retryOnConflict: 3,
  },
  function(err, res) {
    if (err) {
      logger.error(pkg.name + ' failed to remove: ' + err);
      logger.error(res);
    }
    else {
      logger.debug(pkg.name + ' removed from elasticsearch');
    }

    if (callback) {
      callback(err);
    }
  });
}

function bulk(upserts, removals, callback) {
  var body = [];
  upserts.forEach(function(pkg) {
    pkg = JSON.parse(JSON.stringify(pkg));
    delete pkg.__v;
    delete pkg._id;
    pkg.raw_title = pkg.title;

    body.push({update: {
      _id: pkg.name,
      _index: index,
      _type: type,
      _retry_on_conflict : 3
    }});
    body.push({
      doc: pkg,
      doc_as_upsert: true
    });
  });

  if (removals) {
    removals.forEach(function(pkg) {
      pkg = JSON.parse(JSON.stringify(pkg));
      delete pkg.__v;
      delete pkg._id;

      body.push({delete: {
        _id: pkg.name,
        _index: index,
        _type: type,
        _retry_on_conflict : 3
      }});
    });
  }

  client.bulk({
    body: body,
  },
  function(err, res) {
    if (err) {
      logger.error('failed bulk actions: ' + err);
      logger.error(res);
    }
    else {
      logger.debug('bulk actions completed');
    }

    if (callback) {
      callback(err);
    }
  });
}

exports.upsert = upsert;
exports.remove = remove;
exports.bulk = bulk;
