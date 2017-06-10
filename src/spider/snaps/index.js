'use strict';

const promiseLimit = require('promise-limit');

const db = require('../../db');
const SnapElasticsearch = require('../../db/elasticsearch/snap');
const SnapApi = require('./api');
const convert = require('./convert');
const config = require('../../config');
const logger = require('../../logger');

function fetchSnaps() {
    return Promise.all(config.spider.snaps.stores.map((store) => {
        let api = new SnapApi(store.url);

        return api.list().then((snaps) => {
            const limit = promiseLimit(config.spider.snaps.rate_limit);
            return Promise.all(snaps.map((snap) => {
                //Get the latest release
                let release = config.spider.snaps.default_release;
                if (snap.release && snap.release.length > 0) {
                    snap.release.sort();
                    release = snap.release[snap.release.length - 1];
                }

                return limit(() => api.details(snap.package_name, snap.architecture, release));
            }));
        }).then((snaps) => {
            //Update/Insert snaps
            let promises = snaps.map((snapData) => {
                let internalData = convert(snapData);
                internalData.store = store.id;

                return db.Snap.findOne({name: internalData.name, store: store.id}).then((snap) => {
                    let operation = null;
                    if (snap) {
                        operation = {
                            updateOne: {
                                filter: {name: internalData.name, store: store.id},
                                update: internalData,
                            }
                        };
                    }
                    else {
                        logger.debug('New snap: ' + internalData.name);

                        operation = {
                            insertOne: {
                                document: internalData,
                            }
                        };
                    }

                    return operation;
                });
            });

            //Remove snaps not in the store api
            let names = snaps.map((snap) => snap.package_name);
            promises.push(db.Snap.find({store: store.id, name: {'$nin': names}}).then((snaps) => {
                if (snaps.length > 0) {
                    snaps.forEach((snap) => {
                        logger.debug('Removing snap: ' + snap.name);
                    });

                    let removals = snaps.map((snap) => snap.name);
                    return {
                        deleteMany: {
                            filter: {store: store.id, name: {'$in': removals}},
                        }
                    };
                }
            }));

            return Promise.all(promises);
        }).then((operations) => {
            //Filter out any undefined (a result of not needing to remove any snaps)
            operations = operations.filter((operation) => !!operation);

            logger.debug('Saving snaps to db');
            return Promise.all([
                operations,
                db.Snap.bulkWrite(operations),
            ]);
        }).then((results) => {
            let operations = results[0];
            logger.debug('Saving snaps to elasticsearch');

            let upserts = [];
            let removals = [];
            operations.forEach((snap) => {
                if (snap.updateOne) {
                    upserts.push(snap.updateOne.update.$set);
                }
                else if (snap.insertOne) {
                    upserts.push(snap.insertOne.document);
                }
                else if (snap.deleteMany) {
                    removals = snap.deleteMany.filter.name.$in;
                }
            });

            let ses = new SnapElasticsearch();

            return ses.bulk(upserts, removals);
        }).then(() => {
            logger.debug('Finished parsing snaps');
        }).catch((err) => {
            logger.error(err);
        });
    }));
}

exports.fetchSnaps = fetchSnaps;
