var config = {
  //Directory to store images and other data
  data_dir: process.env.OPENSHIFT_DATA_DIR || process.env.DATA_DIR || '/tmp',
  //Temporary directory for storing files being processed (like click packages)
  tmp_dir: '/tmp',
  //Which features to turn on
  capabilities: ['spider', 'app', 'api', 'icons', 'feed'],
  //Convenience functions
  use_spider: function() {
    return (config.capabilities.indexOf('spider') > -1);
  },
  use_app: function() {
    return (config.capabilities.indexOf('app') > -1);
  },
  use_api: function() {
    return (config.capabilities.indexOf('api') > -1);
  },
  use_icons: function() {
    return (config.capabilities.indexOf('icons') > -1);
  },
  use_feed: function() {
    return (config.capabilities.indexOf('feed') > -1);
  },
  use_cloudinary: function() {
    return !!config.cloudinary.api_key;
  },
  server: {
    //The ip address to bind the server to
    ip: process.env.OPENSHIFT_NODEJS_IP || process.env.NODEJS_IP || '0.0.0.0',
    //The port to bind the server to
    port: process.env.OPENSHIFT_NODEJS_PORT || process.env.NODEJS_PORT || process.env.PORT || 8080,
    //Full domain name of the server
    host: process.env.NODEJS_HOST || 'http://local.uappexplorer.com:8080',
    //The location of the frontend files
    static: process.env.NODEJS_STATIC || '/../../www/dist',
    //Secret for the session cookie
    session_secret: process.env.SESSION_SECRET || 'uappexplorer',
    //Limit the number of processes
    process_limit: process.env.PROCESS_LIMIT || 0,
  },
  mongo: {
    //The uri (with username/password) for accessing a mongo database
    uri: process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGODB_URI || 'mongodb://localhost',
    //The name of the mongo database to use
    database: process.env.MONGODB_DB || 'uappexplorer',
  },
  elasticsearch: {
    uri: process.env.ELASTICSEARCH_URI || 'http://localhost:9200/',
  },
  //Urls for the click apps api
  spider: {
    search_api: 'https://search.apps.ubuntu.com/api/v1/search',
    reviews_api: 'https://reviews.ubuntu.com/click/api/1.0/reviews/',
    departments_api: 'https://search.apps.ubuntu.com/api/v1/departments',
    packages_api: 'https://search.apps.ubuntu.com/api/v1/package/',
    //How many packages to pull in a page
    page_size: 500,
    //Which architectures to pull from the store
    architectures: ['i386', 'amd64', 'armhf', 'arm64'],
  },
  //Credentials for logging to Papertrail - https://papertrailapp.com
  papertrail: {
    host: process.env.PAPERTRAIL_HOST,
    port: process.env.PAPERTRAIL_PORT,
  },
  //Credentials for pushing images on Cloudinary - http://cloudinary.com
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  },
  //Credentials for encrypting email addresses with Mailhide - http://www.google.com/recaptcha/mailhide/apikey
  mailhide: {
    privateKey: process.env.MAILHIDE_PRIVATEKEY,
    publicKey: process.env.MAILHIDE_PUBLICKEY,
  },
  //Credentials for downloading click packages (normal Ubuntu login) - https://login.ubuntu.com
  ubuntu_sso: {
    email: process.env.UBUNTU_SSO_EMAIL,
    password: process.env.UBUNTU_SSO_PASSWORD,
    token_name: 'uappexplorer.com',
  }
};

//Disable spider
if (process.env.NODEJS_NO_SPIDER == 1) {
  config.capabilities.splice(config.capabilities.indexOf('spider'), 1);
}

//Disable web/api
if (process.env.NODEJS_SPIDER_ONLY == 1) {
  config.capabilities.splice(config.capabilities.indexOf('api'), 1);
  config.capabilities.splice(config.capabilities.indexOf('app'), 1);
}

//Disable icons
if (process.env.NODEJS_NO_ICONS == 1) {
  config.capabilities.splice(config.capabilities.indexOf('icons'), 1);
}

//Mongo uri from docker
if (process.env.MONGO_PORT) {
  config.mongo.uri = process.env.MONGO_PORT.replace('tcp', 'mongodb');
}

//Elasticsearch uri from docker
if (process.env.ELASTICSEARCH_PORT) {
  config.elasticsearch.uri = process.env.ELASTICSEARCH_PORT.replace('tcp', 'http');
}

module.exports = config;
