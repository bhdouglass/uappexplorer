var mongoose = require('mongoose');

var snapSchema = mongoose.Schema({
    name: {type: String, index: true},
    package_name: String,
    store: {type: String, index: true},
    ubuntu_id: String,

    author: String,
    company: String,
    title: String,
    description: String,
    tagline: String,
    changelog: String,
    license: String,
    terms: String,
    website: String,
    support: String,

    type: String,
    confinement: String,
    keywords: [String],
    screenshots: [String],
    version: String,

    prices: {},
    architecture: [String],
    categories: {type: [String], index: true},
    permissions: [String],
    release: String,

    average_rating: Number,
    total_rating: Number,
    bayesian_average: {type: Number, index: true},
    num_reviews: Number,
    points: {type: Number, index: true},

    filesize: String,
    downloads: {},
    cloudinary_url: String,
    icon_fetch_date: Number,
    icon_filename: String,
    icon_hash: String,
    icon: String,

    last_updated: String,
    published_date: String,

    snapcraft_yaml: String,
});

snapSchema.index({
    title: 'text',
    description: 'text',
    keywords: 'text',
    author: 'text',
    company: 'text',
},
{
    weights: {
        title: 10,
        description: 5,
        keywords: 3,
        author: 1,
        company: 1,
    },
    name: 'searchIndex',
});

var Snap = mongoose.model('Snap', snapSchema);

exports.Snap = Snap;
