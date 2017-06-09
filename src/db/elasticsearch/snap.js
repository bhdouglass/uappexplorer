'use strict';

const elasticsearch = require('elasticsearch');

const config = require('../../config');

const properties = [
    'name',
    'title',
    'store',
    'description',
    'keywords',
    'author',
    'company',
    'license',
    'architecture',
    'icon_hash',
    'bayesian_average',
    'points',
    'tagline',
    'type',
    'categories',
    'confinement',
];

class SnapElasticsearch {
    constructor() {
        this.client = new elasticsearch.Client({host: config.elasticsearch.uri});
        this.index = 'snap';
        this.type = 'snap';
    }

    _convert(snap) {
        let doc = {};
        properties.forEach((prop) => {
            doc[prop] = snap[prop] ? snap[prop] : null;
        });
        doc.search_title = snap.title;
        doc.keywords = doc.keywords ? doc.keywords.map((keyword) => keyword.toLowerCase()) : [];

        return doc;
    }

    upsert(snap) {
        return this.client.update({
            index: this.index,
            type: this.type,
            id: snap.name,
            retryOnConflict: 3,
            body: {
                doc_as_upsert: true,
                doc: this._convert(snap),
            }
        });
    }

    remove(name) {
        return this.client.delete({
            index: this.index,
            type: this.type,
            id: name,
            retryOnConflict: 3,
        });
    }

    //TODO set the id to name & store
    bulk(upserts, removals) {
        var body = [];
        upserts.forEach(function(snap) {
            body.push({update: {
                _id: snap.name,
                _index: this.index,
                _type: this.type,
                _retry_on_conflict : 3
            }});

            body.push({
                doc_as_upsert: true,
                doc: this._convert(snap),
            });
        }, this);

        if (removals) {
            body = body.concat(removals.map((snapName) => {
                return {delete: {
                    _id: snapName,
                    _index: this.index,
                    _type: this.type,
                    _retry_on_conflict : 3
                }};
            }));
        }

        return this.client.bulk({body: body});
    }

    search(query, sort, filters, skip, limit) {
        let request = {
            index: this.index,
            type: this.type,
            body: {
                from: skip ? skip : 0,
                size: limit ? limit : 30,
                query: {
                    multi_match: {
                        query: query.toLowerCase(),
                        fields: ['search_title^3', 'description^2', 'keywords^2', 'author', 'company'],
                        slop: 10,
                        max_expansions: 50,
                        type: 'phrase_prefix',
                    }
                }
            }
        };

        if (filters && filters.and && filters.and.length > 0) {
            request.body.filter = filters;
        }

        if (sort && sort.field) {
            let s = {};
            s[sort.field] = {
                'order': sort.direction,
                'ignore_unmapped': true,
            };
            request.body.sort = [s];
        }

        return this.client.search(request);
    }

    removeIndex() {
        return this.client.indices.delete({index: this.index});
    }

    createIndex() {
        return this.client.indices.create({
            index: this.index,
            body: {
                snap: this.index,
                settings: {
                    analysis: {
                        analyzer: {
                            lower_standard: {
                                type: 'custom',
                                tokenizer: 'standard',
                                filter: 'lowercase'
                            }
                        }
                    }
                },
                mappings: {
                    snap: {
                        properties: {
                            search_title: {
                                type: 'string',
                                analyzer: 'lower_standard'
                            },
                            store: {
                                type: 'string',
                                analyzer: 'lower_standard'
                            },
                            description: {
                                type: 'string',
                                analyzer: 'lower_standard'
                            },
                            keywords: {
                                type: 'string',
                                analyzer: 'lower_standard'
                            },
                            author: {
                                type: 'string',
                                analyzer: 'lower_standard'
                            },
                            company: {
                                type: 'string',
                                analyzer: 'lower_standard'
                            },
                            license: {
                                type: 'string',
                                index: 'not_analyzed'
                            },
                            framework: {
                                type: 'string',
                                index: 'not_analyzed'
                            },
                            architecture: {
                                type: 'string',
                                index: 'not_analyzed'
                            },
                            title: {
                                type: 'string',
                                index: 'not_analyzed'
                            },
                            confinement: {
                                type: 'string',
                                index: 'not_analyzed'
                            }
                        }
                    }
                }
            }
        });
    }
}

module.exports = SnapElasticsearch;
