var Baobab = require('baobab');

module.exports = new Baobab({
  loading: false,
  alert: null,
  modals: {
    faq: false,
    donate: false,
    login: false,
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
});
