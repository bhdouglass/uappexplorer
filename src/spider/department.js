var config = require('../config');
var utils = require('../utils');
var db = require('../db/db');
var logger = require('../logger');
var request = require('request');
var async = require('async');

function saveDepartment(d, callback) {
  logger.info('department: ' + d.name);
  db.Department.findOne({name: d.name}, function(err, dep) {
    if (err) {
      logger.error('error finding ' + d.name + ': ' + err);
      callback(err);
    }
    else {
      if (!dep) {
        dep = new db.Department();
      }

      dep.name = d.name;
      dep.internal_name = d.slug;
      dep.url = utils.fixUrl(d._links.self.href);
      dep.save(function(err) {
        if (err) {
          logger.error('error saving department: ' + err);
          callback(err);
        }
        else {
          logger.info('saved ' + d.name);
          callback(null);
        }
      });
    }
  });
}

function parseDepartments(callback) {
  request({url: config.spider.departments_api, headers: {'User-Agent': config.spider.user_agent}}, function(err, resp, body) {
    if (err) {
      logger.error('error fetching departments: ' + err);
      if (callback) {
        callback(err);
      }
    }
    else {
      var data = JSON.parse(body);
      if (data._embedded && data._embedded['clickindex:department']) {
        async.each(data._embedded['clickindex:department'], saveDepartment, function(err) {
          if (err) {
            logger.error(err);
          }

          if (callback) {
            callback(err);
          }
        });
      }
    }
  });
}

exports.parseDepartments = parseDepartments;
