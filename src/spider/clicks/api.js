'use strict';

const config = require('../../config');
const logger = require('../../logger');

const axios = require('axios');

const OPENSTORE_URL = 'https://open-store.io/api/v1/apps';
class OpenStoreApi {
    list(url, results) {
        url = url ? url : OPENSTORE_URL + '?limit=100';
        results = results ? results : [];

        return axios({
            method: 'get',
            url: url,
            headers: {'User-Agent': config.spider.snaps.user_agent}
        }).then((res) => {
            logger.debug('got package list page: ' + url);

            if (res.data && res.data.data && res.data.data.packages) {
                results = results.concat(res.data.data.packages);
            }

            if (res.data && res.data.data && res.data.data.next) {
                return this.list(res.data.data.next, results);
            }
            else {
                return results;
            }
        });
    }
}

module.exports = OpenStoreApi;
