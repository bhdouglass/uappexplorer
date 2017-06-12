'use strict';

const db = require('./db');
const snaps = require('./spider/snaps');
const clicks = require('./spider/clicks');
const SnapElasticsearch = require('./db/elasticsearch/snap');
const ClickElasticsearch = require('./db/elasticsearch/click');

if (process.argv[2]) {
    if (process.argv[2] == 'clicks' || process.argv[2] == 'click') {
        if (process.argv[3] == 'elasticsearch_index') {
            let ces = new ClickElasticsearch();
            ces.createIndex().then(() => {
                process.exit(0);
            }).catch((err) => {
                console.log(err);
                process.exit(1);
            });
        }
        else if (process.argv[3] == 'elasticsearch_index_remove') {
            let ces = new ClickElasticsearch();
            ces.removeIndex().then(() => {
                process.exit(0);
            }).catch((err) => {
                console.log(err);
                process.exit(1);
            });
        }
        else if (process.argv[3] == 'elasticsearch_update') {
            db.Package.find({}).then((pkgs) => {
                let ces = new ClickElasticsearch();
                return ces.bulk(pkgs);
            }).then(() => {
                process.exit(0);
            }).catch((err) => {
                console.log(err);
                process.exit(1);
            });
        }
        else {
            clicks.fetchClicks().then(() => {
                process.exit(0);
            });
        }
    }
    else if (process.argv[2] == 'snaps' || process.argv[2] == 'snap') {
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
    else {
        console.log('nothing to do');
        process.exit(1);
    }
}
else {
    console.log('nothing to do');
    process.exit(1);
}
