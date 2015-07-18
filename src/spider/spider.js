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
    package.parsePackageUpdates();
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
  reviews_rule.hour = 1;
  reviews_rule.minute = 0;

  schedule.scheduleJob(reviews_rule, function() {
    logger.info('spider: running review spider');
    review.parseReviews();
  });

  //one time scheduling
  var one_time = new Date(2015, 6, 18, 1, 45, 0);
  var now = new Date();
  if (one_time > now) {
    schedule.scheduleJob(one_time, function() {
      logger.info('spider: running spider (once)');
      package.parsePackages();
      //review.parseReviews();
      //packageParser.parseAllClickPackages();
    });
  }
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

exports.parsePackage = package.parsePackage;
exports.parsePackages = package.parsePackages;
exports.parsePackageUpdates = package.parsePackageUpdates;
exports.mongoToElasticsearch = package.mongoToElasticsearch;
exports.parseDepartments = department.parseDepartments;
exports.parseReviews = review.parseReviews;
exports.refreshRatings = review.refreshRatings;
exports.calculateBayesianAverages = review.calculateBayesianAverages;
exports.parseClickPackage = packageParser.parseClickPackage;
exports.parseClickPackageByName = packageParser.parseClickPackageByName;
exports.parseAllClickPackages = packageParser.parseAllClickPackages;
exports.setupSchedule = setupSchedule;
exports.server = server;
