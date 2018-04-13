var Baobab = require('baobab');

var DEFAULT_SORT = '-published_date';
var LIMIT = 30;

module.exports = new Baobab({
  loading: false,
  alert: {},
  modals: {
    faq: false,
    donate: false,
    login: false,
  },

  location: {
    previous: '/',
    current: '/',
  },

  info: {
    loaded: false,

    counts: {
      applications: 0,
      games: 0,
      snaps: 0,
      gadget_snaps: 0,
    },

    'new': {
      count: 0,
      apps: [],
    },

    new_snaps: {
      count: 0,
      apps: [],
    },

    essentials: {
      count: 0,
      apps: [],
    }
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
  previousLastPage: null,
  nextLastPage: null,

  apps: {},
  snaps: {},
  cache_keys: [],
  frameworks: [],

  app: null,
  missingApp: null,
  reviews: {
    params: {},
    reviews: [],
    more: false,
    name: null,
    stats: {},
    loaded: false,
  },

  snap: null,
  missingSnap: null,

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

  lng: null,
});
