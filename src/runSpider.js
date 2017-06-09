'use strict';

var snaps = require('./spider/snaps');
var SnapElasticsearch = require('./db/elasticsearch/snap');

if (process.argv[2]) {
    if (process.argv[2] == 'snaps' || process.argv[2] == 'snap') {
        if (process.argv[3] == 'elasticsearch_index') {
            let ses = new SnapElasticsearch();
            ses.createIndex().then(() => {
                process.exit(0);
            }).catch((err) => {
                console.log(err);
                process.exit(1);
            });
        }
        else if (process.argv[3] == 'elasticsearch_index_remove') {
            let ses = new SnapElasticsearch();
            ses.removeIndex().then(() => {
                process.exit(0);
            }).catch((err) => {
                console.log(err);
                process.exit(1);
            });
        }
        else {
            snaps.fetchSnaps().then(() => {
                process.exit(0);
            });
        }
    }
}
else {
    console.log('nothing to do');
    process.exit(1);
}
