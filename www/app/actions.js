var tree = require('./trees/state');
var api = require('./api');

module.exports = {
  getCounts: function() {
    if (!tree.get('counts').loaded) {
      tree.set('loading', true);
      api.getCounts().then(function(data) {
        data.loaded = true;
        tree.set('counts', data);
        tree.set('loading', false);
      });
      //TODO catch errors
    }
  },

  getTopApps: function() {
    //TODO caching

    tree.set('loading', true);
    api.getApps({sort: '-points', limit: 12}).then(function(data) {
      tree.set('top', data.apps);
      tree.set('loading', false);
    });
    //TODO catch errors
  },

  getNewApps: function() {
    //TODO caching

    tree.set('loading', true);
    api.getApps({sort: '-published_date', limit: 6}).then(function(data) {
      tree.set('new', data.apps);
      tree.set('loading', false);
    });
    //TODO catch errors
  },

  getApps: function(paging) {
    //TODO caching

    tree.set('loading', true);
    api.getApps(paging).then(function(data) {
      tree.select('apps').set(JSON.stringify(paging), data);
      tree.set('loading', false);
    });
    //TODO catch errors
  }
};
