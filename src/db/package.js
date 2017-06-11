var mongoose = require('mongoose');

var packageSchema = mongoose.Schema({
    name: {type: String, index: true},
    title: String,
    author: String,
    company: String,
    support: String,
    types: {type: [String], index: true},
    version: String,
    store: String,

    tagline: String,
    description: String,
    changelog: String,
    terms: String,
    license: String,
    prices: {},
    url: String,
    website: String,

    categories: {type: [String], index: true},
    features: [String], //content_hub, url_dispatcher, push_helper, account_service
    architecture: [String],
    keywords: [String],
    framework: [String],
    permissions: [String],

    average_rating: Number,
    bayesian_average: {type: Number, index: true},
    num_reviews: Number,
    total_rating: Number,
    points: {type: Number, index: true},

    cloudinary_url: String,
    download: String,
    downloads: {},
    filesize: String,
    icon_fetch_date: Number,
    icon_filename: String,
    icon_hash: String,
    icon: String,
    screenshot: String,
    screenshots: [String],

    scope_ini: {},
    desktop_file: {},
    url_dispatcher: [String],
    webapp_inject: Boolean,

    published_date: String,
    last_updated: String,

    //TODO see if these can be removed
    status: String,
    monthly_popularity: Number,
    type: String,
});

packageSchema.index({
    title: 'text',
    description: 'text',
    keywords: 'text',
    author: 'text',
    company: 'text',
}, {
    weights: {
        title: 10,
        description: 5,
        keywords: 3,
        author: 1,
        company: 1,
    },
    name: 'searchIndex',
});

var Package = mongoose.model('Package', packageSchema);

exports.Package = Package;
