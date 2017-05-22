'use strict';

const axios = require('axios');

const config = require('../../config');
const logger = require('../../logger');

class SnapApi {
    constructor(url) {
        this.url = url;
    }

    listArch(url, arch, results) {
        results = results ? results : [];

        let headers = {'User-Agent': config.spider.snaps.user_agent};
        if (arch) {
            headers['X-Ubuntu-Architecture'] = arch;
        }

        return axios({
            method: 'get',
            url: url,
            headers: headers
        }).then((res) => {
            logger.debug('got package list page: ' + url + ' (' + arch + ')');

            if (res.data && res.data._embedded && res.data._embedded['clickindex:package']) {
                results = results.concat(res.data._embedded['clickindex:package']);
            }

            if (res.data._links && res.data._links.next && res.data._links.next.href) {
                return this.listArch(res.data._links.next.href, arch, results);
            }
            else {
                return results;
            }
        });
    }

    list() {
        let url = `${this.url}/search?size=${config.spider.snaps.page_size}&confinement=strict,devmode,classic`;
        let promises = config.spider.snaps.architectures.map((arch) => {
            return this.listArch(url, arch);
        });
        promises.unshift(this.listArch(url, null));

        return Promise.all(promises).then((results) => {
            let snapMap = {};
            let arch = 'all';
            let index = 0;

            results.forEach((list) => {
                logger.debug(`total packages (${arch}): ${list.length}`);

                list.forEach((snap) => {
                    snap.architecture = (snap.architecture) ? snap.architecture : [arch];

                    if (!snapMap[snap.package_name]) {
                        snapMap[snap.package_name] = snap;
                    }
                    else {
                        let arches = snap.architecture.concat(snapMap[snap.package_name].architecture);
                        if (arches.indexOf('all') > -1) {
                            arches = ['all'];
                        }

                        if (snap.revision > snapMap[snap.package_name].revision) {
                            snapMap[snap.package_name] = snap;
                        }

                        snapMap[snap.package_name].architecture = arches;
                    }
                });

                if (index < config.spider.snaps.architectures.length) {
                    arch = config.spider.snaps.architectures[index];
                    index++;
                }
            });

            let snaps = [];
            for (let name in snapMap) {
                snaps.push(snapMap[name]);
            }

            logger.debug(`total packages: ${snaps.length}`);

            return snaps;
        });
    }

    detailsArch(url, arch, series) {
        let headers = {
            'User-Agent': config.spider.snaps.user_agent,
            'X-Ubuntu-Series': series,
        };

        if (arch && arch != 'all') {
            headers['X-Ubuntu-Architecture'] = arch;
        }

        console.log(url, headers);

        return axios({
            method: 'get',
            url: url,
            headers: headers
        }).then((res) => {
            return res.data;
        });
    }

    details(packageName, arches, series) {
        logger.debug('getting details for ' + packageName);

        let url = `${this.url}/details/${packageName}`;
        let promises = arches.map((arch) => {
            return this.detailsArch(url, arch, series);
        });

        return Promise.all(promises).then((results) => {
            let snap = null;
            let downloads = {};

            results.forEach((result) => {
                if (!snap || result.revision > snap.revision) {
                    snap = result;
                }

                if (result.allow_unauthenticated && result.anon_download_url) {
                    downloads[result.architecture[0]] = result.anon_download_url;
                }
            });

            if (snap) {
                snap.downloads = downloads;
                snap.architecture = arches;
            }

            return snap;
        });
    }
}

module.exports = SnapApi
