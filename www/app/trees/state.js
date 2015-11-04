var Baobab = require('baobab');

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
  },
  search: {
    show: false,
    term: '',
  },
  loading: false,
  top: [],
  'new': [],
  apps: {},
  frameworks: [],
});
