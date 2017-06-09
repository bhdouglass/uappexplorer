'use strict';

const db = require('../db/db');
const config = require('../config');
const logger = require('../logger');
const snapIcon = require('./snap').snapIcon;
const RSS = require('rss');

let typeMap = {
    application: 'App',
    scope: 'Scope',
    webapp: 'Web App',
};

let snapTypeMap = {
    oem: 'OEM Snap',
    os: 'OS Snap',
    kernel: 'Kernel Snap',
    gadget: 'Gadget Snap',
    framework: 'Framework Snap',
    application: 'Snap',
};

function type(types) {
    let t = 'application';
    if (types.indexOf('application') > -1) {
        t = 'application';
    }
    else if (types.indexOf('webapp') > -1) {
        t = 'webapp';
    }
    else if (types.length > 0) {
        t = types[0];
    }

    let value = '';
    if (typeMap[t]) {
        value = typeMap[t];
    }

    return value;
}

function snapsAndApps(sort) {
    return Promise.all([
        db.Package.find().limit(10).sort(sort),
        db.Snap.find().limit(10).sort(sort).then((snaps) => {
            return snaps.map((snap) => {
                snap.is_snap = true;
                return snap;
            });
        }),
    ]).then((results) => {
        let pkgs = results[0].concat(results[1]);

        pkgs.sort((a, b) => {
            if (a.published_date < b.published_date) {
                return -1;
            }

            if (a.published_date > b.published_date) {
                return 1;
            }

            return 0;
        });

        return pkgs.slice(0, 10).map((pkg) => {
            pkg.type = pkg.is_snap ? snapTypeMap[pkg.type] : type(pkg.types);
            pkg.icon = config.server.host + '/api/icon/' + pkg.name + '.png';
            pkg.url = config.server.host + '/app/' + pkg.name;
            if (pkg.is_snap) {
                pkg.url = config.server.host + '/snap/' + pkg.store + '/' + pkg.name;
                pkg.icon = snapIcon(pkg);
            }

            return pkg;
        });
    });
}

function setup(app, success, error) {
    app.get('/api/rss/new-apps.xml', function(req, res) {
        let feed = new RSS({
            title:       'uApp Explorer New Apps',
            description: 'New apps in uApp Explorer',
            feed_url:    config.server.host + '/api/rss/new-apps.xml',
            site_url:    config.server.host,
            image_url:   config.server.host + '/img/app-logo.png',
            ttl:         240 //4 hours
        });

        snapsAndApps('-published_date').then((pkgs) => {
            pkgs.forEach((pkg) => {
                let description = pkg.description ? '<br/>' + pkg.description : '';

                feed.item({
                    title:           'New ' + pkg.type + ': ' + pkg.title,
                    url:             pkg.url,
                    description:     '<a href="' + pkg.url + '"><img src="' + pkg.icon + '" /></a>' + description,
                    author:          pkg.author,
                    date:            pkg.last_updated,
                    custom_elements: [{tagline: pkg.tagline ? pkg.tagline : ''}],
                });
            });

            res.header('Content-Type', 'text/xml');
            res.send(feed.xml({indent: true}));
        }).catch((err) => {
            logger.error('RSS feed error', err);
            error(res, err);
        });
    });

    app.get('/api/rss/new-apps2.xml', function(req, res) {
        let feed = new RSS({
            title:       'uApp Explorer New Apps',
            description: 'New apps in uApp Explorer',
            feed_url:    config.server.host + '/api/rss/new-apps2.xml',
            site_url:    config.server.host,
            image_url:   config.server.host + '/img/app-logo.png',
            ttl:         240 //4 hours
        });

        snapsAndApps('-published_date').then((pkgs) => {
            pkgs.forEach((pkg) => {
                let description = pkg.description ? '<br/>' + pkg.description : '';
                let tagline = pkg.tagline ? ' - ' + pkg.tagline : '';

                feed.item({
                    title:           'New ' + pkg.type + ': ' + pkg.title + tagline,
                    url:             pkg.url,
                    description:     '<a href="' + pkg.url + '"><img src="' + pkg.icon + '" /></a>' + description,
                    author:          pkg.author,
                    date:            pkg.last_updated,
                    custom_elements: [{tagline: pkg.tagline ? pkg.tagline : ''}],
                });
            });

            res.header('Content-Type', 'text/xml');
            res.send(feed.xml({indent: true}));
        }).catch((err) => {
            logger.error('RSS feed error', err);
            error(res, err);
        });
    });

    app.get('/api/rss/updated-apps.xml', function(req, res) {
        let feed = new RSS({
            title:       'uApp Explorer Updated Apps',
            description: 'Updated apps in uApp Explorer',
            feed_url:    config.server.host + '/api/rss/updated-apps.xml',
            site_url:    config.server.host,
            image_url:   config.server.host + '/img/app-logo.png',
            ttl:         240 //4 hours
        });

        snapsAndApps('-last_updated').then((pkgs) => {
            pkgs.forEach((pkg) => {
                let changelog = pkg.changelog ? pkg.changelog : '';
                changelog = changelog.replace('\n', '<br/>');
                changelog = changelog ? '<br/><br/>Changelog:<br/>' + changelog : '';
                let description = pkg.description ? '<br/><br/>Description:<br/>' + pkg.description : '';

                feed.item({
                    title:           pkg.type + ': ' + pkg.title + ' (v' + pkg.version + ')',
                    url:             pkg.url,
                    description:     '<a href="' + pkg.url + '"><img src="' + pkg.icon +
                        '" /></a>' + changelog + description,
                        author:          pkg.author,
                    date:            pkg.last_updated,
                    custom_elements: [{tagline: pkg.tagline ? pkg.tagline : ''}],
                });
            });

            res.header('Content-Type', 'text/xml');
            res.send(feed.xml({indent: true}));
        }).catch((err) => {
            logger.error('RSS feed error', err);
            error(res, err);
        });
    });

    app.get('/api/rss/new-snaps.xml', function(req, res) {
        let feed = new RSS({
            title:       'uApp Explorer New Snaps',
            description: 'New snaps in uApp Explorer',
            feed_url:    config.server.host + '/api/rss/new-snaps.xml',
            site_url:    config.server.host,
            image_url:   config.server.host + '/img/app-logo.png',
            ttl:         240 //4 hours
        });

        db.Snap.find({}).limit(10).sort('-published_date').then((snaps) => {
            snaps.forEach((snap) => {
                let description = snap.description ? '<br/>' + snap.description : '';
                let url = config.server.host + '/snap/' + snap.store + '/' + snap.name;

                feed.item({
                    title:           'New ' + snapTypeMap[snap.type] + ': ' + snap.title,
                    url:             url,
                    description:     '<a href="' + url + '"><img src="' + snapIcon(snap) + '" /></a>' + description,
                    author:          snap.author,
                    date:            snap.last_updated,
                    custom_elements: [{tagline: snap.tagline ? snap.tagline : ''}],
                });
            });

            res.header('Content-Type', 'text/xml');
            res.send(feed.xml({indent: true}));
        }).catch((err) => {
            logger.error('RSS feed error', err);
            error(res, err);
        });
    });
}

exports.setup = setup;
