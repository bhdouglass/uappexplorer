'use strict';

const config = require('../config');
const logger = require('../logger');
const clicks = require('./clicks');
const snaps = require('./snaps');
const schedule = require('node-schedule');
const express = require('express');

function setupSchedule() {
    logger.debug('scheduling spider');

    let spider_rule_clicks = new schedule.RecurrenceRule();
    spider_rule_clicks.dayOfWeek = new schedule.Range(0, 6, 1);
    spider_rule_clicks.hour = new schedule.Range(1, 23, 2);
    spider_rule_clicks.minute = 0;

    schedule.scheduleJob(spider_rule_clicks, function() {
        clicks.fetchClicks();
    });

    let spider_rule_snaps = new schedule.RecurrenceRule();
    spider_rule_snaps.dayOfWeek = new schedule.Range(0, 6, 1);
    spider_rule_snaps.hour = new schedule.Range(0, 23, 6);
    spider_rule_snaps.minute = 0;

    schedule.scheduleJob(spider_rule_snaps, function() {
        snaps.fetchSnaps();
    });
}

function server() {
    let app = express();

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

exports.setupSchedule = setupSchedule;
exports.server = server;
