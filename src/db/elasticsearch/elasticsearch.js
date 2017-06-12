'use strict';

const elasticsearch = require('elasticsearch');

const config = require('../../config');

class Elasticsearch {
    constructor() {
        this.client = new elasticsearch.Client({host: config.elasticsearch.uri});
    }

    _convert(item) {
        let doc = {};
        this.properties.forEach((prop) => {
            doc[prop] = item[prop] ? item[prop] : null;
        });
        doc.search_title = item.title;
        doc.keywords = doc.keywords ? doc.keywords.map((keyword) => keyword.toLowerCase()) : [];

        return doc;
    }

    upsert(item) {
        return this.client.update({
            index: this.index,
            type: this.type,
            id: item.name,
            retryOnConflict: 3,
            body: {
                doc_as_upsert: true,
                doc: this._convert(item),
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

    bulk(upserts, removals) {
        let body = [];
        upserts.forEach((item) => {
            body.push({update: {
                _id: item.name,
                _index: this.index,
                _type: this.type,
                _retry_on_conflict : 3
            }});

            body.push({
                doc_as_upsert: true,
                doc: this._convert(item),
            });
        }, this);

        if (removals) {
            body = body.concat(removals.map((name) => {
                return {delete: {
                    _id: name,
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
                        fields: this.search_fields,
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
        throw 'Not Implemented';
    }
}

module.exports = Elasticsearch;
