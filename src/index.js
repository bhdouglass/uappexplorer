'use strict';

const server = require('./server');
const spider = require('./spider');
const config = require('./config');
const logger = require('./logger');
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    if (config.use_spider()) {
        spider.setupSchedule();

        if (!config.use_app() && !config.use_api()) {
            spider.server();
        }
    }

    if (config.use_app() || config.use_api()) {
        let cpus = os.cpus().length;
        let processes = cpus;
        if (config.server.process_limit > 0 && cpus > config.server.process_limit) {
            processes = config.server.process_limit;
            logger.debug('limiting processes to ' + processes + ' (CPUs: ' + cpus + ')');
        }
        else {
            logger.debug('spawning ' + processes + ' processes');
        }

        for (let i = 0; i < processes; i += 1) {
            cluster.fork();
        }

        cluster.on('exit', () => {
            cluster.fork();
        });
    }
}
else {
    if (config.use_app() || config.use_api()) {
        server.run();
    }
}
