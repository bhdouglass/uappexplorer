var config = require('../config');
var logger = require('../logger');
var db = require('./db');
var elasticsearch = require('elasticsearch');
var _ = require('lodash');

var index = 'packages';
var type = 'package';

function upsert(pkg, callback) {
  var client = new elasticsearch.Client({host: config.elasticsearch.uri});

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
  var client = new elasticsearch.Client({host: config.elasticsearch.uri});

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
  var client = new elasticsearch.Client({host: config.elasticsearch.uri});

  var body = [];
  upserts.forEach(function(pkg) {
    pkg = JSON.parse(JSON.stringify(pkg));
    delete pkg.__v;
    delete pkg._id;
    pkg.raw_title = pkg.title;

    var keywords = [];
    _.forEach(pkg.keywords, function(keyword) {
      keywords.push(keyword.toLowerCase());
    });

    pkg.keywords = keywords;

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

function mongoToElasticsearch(removals, callback_or_create_indices, callback) {
  create_indices = false;
  if (typeof callback_or_create_indices == 'function') {
    callback = callback_or_create_indices;
  }
  else {
    create_indices = callback_or_create_indices;
  }

  var client = new elasticsearch.Client({host: config.elasticsearch.uri});

  if (create_indices) {
    client.indices.create({
      index: 'packages',
      body: {
        packages: 'packages',
        settings: {
          'analysis':{
            'analyzer': {
              'lower_standard': {
                'type': 'custom',
                'tokenizer': 'standard',
                'filter': 'lowercase'
              }
            }
          }
        },
        mappings: {
          'package': {
            'properties': {
              'title': {
                'type': 'string',
                'analyzer': 'lower_standard'
              },
              'description': {
                'type': 'string',
                'analyzer': 'lower_standard'
              },
              'keywords': {
                'type': 'string',
                'analyzer': 'lower_standard'
              },
              'author': {
                'type': 'string',
                'analyzer': 'lower_standard'
              },
              'company': {
                'type': 'string',
                'analyzer': 'lower_standard'
              },
              'license': {
                'type': 'string',
                'index': 'not_analyzed'
              },
              'framework': {
                'type': 'string',
                'index': 'not_analyzed'
              },
              'architecture': {
                'type': 'string',
                'index': 'not_analyzed'
              },
              'raw_title': {
                'type': 'string',
                'index': 'not_analyzed'
              }
            }
          }
        }
      }
    },
    function (err) {
      if (err) {
        logger.error(err);
      }

      db.Package.find({}, function(err, pkgs) {
        if (err) {
          logger.error(err);
        }
        else {
          bulk(pkgs, removals, callback);
        }
      });
    });
  }
  else {
    db.Package.find({}, function(err, pkgs) {
      if (err) {
        logger.error(err);
      }
      else {
        bulk(pkgs, removals, callback);
      }
    });
  }
}

exports.upsert = upsert;
exports.remove = remove;
exports.bulk = bulk;
exports.mongoToElasticsearch = mongoToElasticsearch;
