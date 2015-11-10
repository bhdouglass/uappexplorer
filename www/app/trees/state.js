var Baobab = require('baobab');

//TODO organize this
module.exports = new Baobab({
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
  loading: false,
  top: [],
  'new': [],
  apps: {},
  frameworks: [],
  reviews: {},
  essentials: {
    loaded: false,
    apps: [],
  },
  userLists: {
    loaded: false,
    lists: [],
  },
  savingSettings: false,
});
