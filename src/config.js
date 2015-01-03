exports.data_dir = process.env.OPENSHIFT_DATA_DIR || process.env.DATA_DIR || '/tmp'

exports.server = {
  ip: process.env.OPENSHIFT_NODEJS_IP || process.env.NODEJS_IP || '127.0.0.1',
  port: process.env.OPENSHIFT_NODEJS_PORT || process.env.NODEJS_PORT || 8080,
}

exports.mongo = {
  uri: process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGODB_URI || 'mongodb://localhost/',
  database: process.env.MONGODB_DB || 'appstore',
}

exports.spider = {
  search_api: 'https://search.apps.ubuntu.com/api/v1/search',
  reviews_api: 'https://reviews.ubuntu.com/click/api/1.0/reviews/',
}
