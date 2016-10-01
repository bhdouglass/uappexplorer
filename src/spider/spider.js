var config = require('../config');
var logger = require('../logger');
var department = require('./department');
var review = require('./review');
var package = require('./package');
var packageParser = require('./packageParser');
var schedule = require('node-schedule');
var express = require('express');

function setupSchedule() {
  logger.debug('scheduling spider');
  var spider_rule = new schedule.RecurrenceRule();
  spider_rule.dayOfWeek = 1;
  spider_rule.hour = 0;
  spider_rule.minute = 0;

  schedule.scheduleJob(spider_rule, function() {
    package.parsePackages();
  });

  var spider_rule_packages = new schedule.RecurrenceRule();
  spider_rule_packages.dayOfWeek = 1;
  spider_rule_packages.hour = 3;
  spider_rule_packages.minute = 0;

  schedule.scheduleJob(spider_rule_packages, function() {
    packageParser.parseAllClickPackages();
  });

  var spider_rule_updates = new schedule.RecurrenceRule();
  spider_rule_updates.dayOfWeek = new schedule.Range(0, 6, 1);
  spider_rule_updates.hour = new schedule.Range(0, 23, 1);
  spider_rule_updates.minute = 0;

  schedule.scheduleJob(spider_rule_updates, function() {
    package.parsePackages(true);
  });

  var department_rule = new schedule.RecurrenceRule();
  department_rule.dayOfWeek = 0;
  department_rule.hour = 0;
  department_rule.minute = 0;

  schedule.scheduleJob(department_rule, function() {
    logger.info('spider: running department spider');
    department.parseDepartments();
  });

  var reviews_rule = new schedule.RecurrenceRule();
  reviews_rule.dayOfWeek = new schedule.Range(0, 6, 1);
  reviews_rule.hour = new schedule.Range(0, 23, 6);
  reviews_rule.minute = 0;

  schedule.scheduleJob(reviews_rule, function() {
    logger.info('spider: running review spider 0');
    review.parseReviews(null, 0, 3);
  });

  reviews_rule.hour = new schedule.Range(1, 23, 6);
  schedule.scheduleJob(reviews_rule, function() {
    logger.info('spider: running review spider 1');
    review.parseReviews(null, 1, 3);
  });

  reviews_rule.hour = new schedule.Range(2, 23, 6);
  schedule.scheduleJob(reviews_rule, function() {
    logger.info('spider: running review spider 2');
    review.parseReviews(null, 2, 3);
  });

  var types_reparse = new schedule.RecurrenceRule();
  types_reparse.dayOfWeek = new schedule.Range(0, 6, 1);
  types_reparse.hour = new schedule.Range(0, 23, 1);
  types_reparse.minute = 30;

  schedule.scheduleJob(types_reparse, function() {
    logger.debug('spider: running types reparser');
    package.reparsePackagesMissingTypes();
  });
}

function server() {
  var app = express();

  app.get('/', function(req, res) {
    res.send({
      success: true,
      data: {
        alive: true
      },
      message: null
    });
  });

  app.listen(config.server.port, config.server.ip);
}

exports.parsePackageByName = package.parsePackageByName;
exports.parsePackages = package.parsePackages;
exports.reparsePackagesMissingTypes = package.reparsePackagesMissingTypes;
exports.parseDepartments = department.parseDepartments;
exports.parseReviews = review.parseReviews;
exports.refreshRatings = review.refreshRatings;
exports.calculateBayesianAverages = review.calculateBayesianAverages;
exports.parseClickPackage = packageParser.parseClickPackage;
exports.parseClickPackageByName = packageParser.parseClickPackageByName;
exports.parseAllClickPackages = packageParser.parseAllClickPackages;
exports.setupSchedule = setupSchedule;
exports.server = server;
