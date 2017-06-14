'use strict';

const db = require('../../db');
const ClickElasticsearch = require('../../db/elasticsearch/click');
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
        let names = [];
        let removals = [];
        results[0].forEach((click) => {
            if (click.updateOne) {
                names.push(click.updateOne.update.$set.name);
            }
            else if (click.insertOne) {
                names.push(click.insertOne.document.name);
            }
            else if (click.deleteMany) {
                removals = click.deleteMany.filter.name.$in;
            }
        });

        return Promise.all([
            db.Package.find({name: {$in: names}}),
            removals
        ]);
    }).then((results) => {
        logger.debug('Saving clicks to elasticsearch');

        let ces = new ClickElasticsearch();
        return ces.bulk(results[0], results[1]);
    }).then(() => {
        logger.debug('Finished parsing clicks');
    }).catch((err) => {
        logger.error(err);
    });
}

exports.fetchClicks = fetchClicks;
