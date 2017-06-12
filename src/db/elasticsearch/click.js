'use strict';

const Elasticsearch = require('./elasticsearch');

class ClickElasticsearch extends Elasticsearch {
    constructor() {
        super();

        this.index = 'packages';
        this.type = 'package';

        this.properties = [
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
            'types',
            'categories',
            'framework',
        ];

        this.search_fields = [
            'search_title^3',
            'description^2',
            'keywords^2',
            'author',
            'company'
        ];
    }

    createIndex() {
        return this.client.indices.create({
            index: this.index,
            body: {
                packages: this.index,
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
                    'package': {
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
                            architecture: {
                                type: 'string',
                                index: 'not_analyzed'
                            },
                            title: {
                                type: 'string',
                                index: 'not_analyzed'
                            },
                            framework: {
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

module.exports = ClickElasticsearch;
