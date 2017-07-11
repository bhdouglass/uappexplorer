'use strict';

const axios = require('axios');

const config = require('../../config');
const logger = require('../../logger');

class SnapApi {
    constructor(url) {
        this.url = url;
    }

    listArch(url, arch, section, results) {
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
            logger.debug(`got package list page: ${url} (${arch}, ${section})`);

            if (res.data && res.data._embedded && res.data._embedded['clickindex:package']) {
                results = results.concat(res.data._embedded['clickindex:package'].map((snap) => {
                    snap.section = section;
                    return snap;
                }));
            }

            if (res.data._links && res.data._links.next && res.data._links.next.href) {
                return this.listArch(res.data._links.next.href, arch, section, results);
            }
            else {
                return results;
            }
        });
    }

    searchList() {
        let url = `${this.url}/search?size=${config.spider.snaps.page_size}&confinement=strict,devmode,classic`;
        let promises = config.spider.snaps.architectures.map((arch) => {
            return this.listArch(url, arch, null);
        });
        promises.unshift(this.listArch(url, null, null));

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
                        arches = arches.filter((value, index, self) => {
                            return self.indexOf(value) === index;
                        });

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

    list() {
        return Promise.all([
            this.searchList(),
            this.searchSectionList(),
        ]).then((results) => {
            let searchResults = results[0];
            let sectionResults = results[1];

            searchResults.forEach((searchResult) => {
                searchResult.sections = sectionResults.filter((sectionResult) => {
                    return (sectionResult.package_name == searchResult.package_name);
                }).map((sectionResult) => {
                    return sectionResult.section;
                });
            });

            return searchResults;
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

        return axios({
            method: 'get',
            url: url,
            headers: headers
        }).then((res) => {
            return res.data;
        });
    }

    details(packageName, arches, sections, series) {
        logger.debug('getting details for ' + packageName);

        let url = `${this.url}/details/${packageName}`;
        let promises = arches.map((arch) => {
            return this.detailsArch(url, arch, series).catch(() => {
                logger.error(`Failed getting details of snap "${packageName}:${arch}"`);
                return null;
            });
        });

        return Promise.all(promises).then((results) => {
            let snap = null;
            let downloads = {};

            results.forEach((result) => {
                if (result) {
                    if (!snap || result.revision > snap.revision) {
                        snap = result;
                    }

                    if (result.anon_download_url) {
                        downloads[result.architecture[0]] = result.anon_download_url;
                    }
                }
            });

            if (snap) {
                snap.downloads = downloads;
                snap.architecture = arches;
                snap.sections = sections;
            }

            return snap;
        });
    }

    sections() {
        let url = `${this.url}/sections`;
        let headers = {
            'User-Agent': config.spider.snaps.user_agent,
        };

        return axios({
            method: 'get',
            url: url,
            headers: headers,
        }).then((res) => {
            return res.data._embedded['clickindex:sections'];
        });
    }

    searchSectionList() {
        return this.sections().then((sections) => {
            return Promise.all(sections.map((section) => {
                return this.listArch(`${this.url}/search?size=${config.spider.snaps.page_size}&confinement=strict,devmode,classic&section=${section.name}`, null, section.name);
            }));
        }).then((sectionResults) => {
            let results = [];
            sectionResults.forEach((sectionResult) => {
                results = results.concat(sectionResult);
            });

            return results;
        });
    }
}

module.exports = SnapApi;
