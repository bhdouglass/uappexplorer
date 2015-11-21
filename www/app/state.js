var Baobab = require('baobab');

var DEFAULT_SORT = '-published_date';
var LIMIT = 30;

module.exports = new Baobab({
  loading: false,
  alert: null,
  modals: {
    faq: false,
    donate: false,
    login: false,
  },

  location: {
    previous: '/',
    current: '/',
  },

  counts: {
    applications: 0,
    webapps: 0,
    scopes: 0,
    games: 0,
    loaded: false,
  },

  auth: {
    loggedin: false,
    user: null,
    authorization: null,
  },

  previousApp: null,
  nextApp: null,
  lastPage: {
    skip: 0,
    limit: LIMIT,
    sort: DEFAULT_SORT,
    mini: true,
    query: {},
  },

  top: [],
  'new': [],
  apps: {},
  frameworks: [],
  essentials: {
    loaded: false,
    apps: [],
  },

  app: null,
  reviews: {},

  savingSettings: false,
  userList: {},
  userLists: {
    loaded: false,
    lists: [],
  },

  og: {
    title: 'uApp Explorer',
    description: 'Browse and discover apps for Ubuntu Touch',
    image: 'https://uappexplorer.com/img/logo.png',
  },
});
