'use strict';

const db = require('../../db');
const OpenStoreApi = require('./api');
const convert = require('./convert');
const logger = require('../../logger');

function fetchClicks() {
    let api = new OpenStoreApi();
    return api.list().then((clicks) => {
        let promises = clicks.map((clickData) => {
            let internalData = convert(clickData);

            return db.Package.findOne({name: internalData.name}).then((click) => {
                let operation = null;
                if (click) {
                    logger.debug('Updating click: ' + internalData.name);
                    operation = {
                        updateOne: {
                            filter: {name: internalData.name},
                            update: internalData,
                        }
                    };
                }
                else {
                    logger.debug('New click: ' + internalData.name);

                    operation = {
                        insertOne: {
                            document: internalData,
                        }
                    };
                }

                return operation;
            });
        });

        //Remove clicks not in the api
        let names = clicks.map((click) => click.id);

        //Check for the store here but not above so we don't kill all the old apps from the ubuntu store
        promises.push(db.Package.find({store: 'openstore', name: {'$nin': names}}).then((clicks) => {
            if (clicks.length > 0) {
                clicks.forEach((click) => {
                    logger.debug('Removing click: ' + click.name);
                });

                let removals = clicks.map((click) => click.name);
                return {
                    deleteMany: {
                        filter: {name: {'$in': removals}},
                    }
                };
            }
        }));

        return Promise.all(promises);
    }).then((operations) => {
        //Filter out any undefined (a result of not needing to remove any clicks)
        operations = operations.filter((operation) => !!operation);

        logger.debug('Saving clicks to db');
        return Promise.all([
            operations,
            db.Package.bulkWrite(operations),
        ]);
    }).then((results) => {
        let operations = results[0];
        logger.debug('Saving clicks to elasticsearch');

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

        //TODO elasticsearch saving
        //let ses = new SnapElasticsearch();

        //return ses.bulk(upserts, removals);
    }).then(() => {
        logger.debug('Finished parsing clicks');
    }).catch((err) => {
        logger.error(err);
    });
}

exports.fetchClicks = fetchClicks;
