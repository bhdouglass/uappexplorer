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

  getEssentials: function() {
    if (!tree.get('essentials').loaded) {
      api.getEssentials().then(function(data) {
        tree.set('essentials', {
          loaded: true,
          apps: data,
        });
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
  },

  getFrameworks: function() {
    if (tree.get('frameworks').length === 0) {
      api.getFrameworks().then(function(data) {
        data.unshift('All');
        tree.set('frameworks', data);
      });
      //TODO catch errors
    }
  },

  getApp: function(name) {
    tree.set('loading', true);
    tree.set('app', {});
    api.getApp(name).then(function(data) {
      tree.set('loading', false);
      tree.set('app', data);
    });
    //TODO catch errors
  },

  getReviews: function(name, params) {
    if (name != tree.select('reviews').get().name) {
      tree.set('reviews', {loaded: false});
    }

    api.getReviews(name, params).then(function(data) {
      data.loaded = true;
      data.params = params;

      if (data.name == tree.select('reviews').get().name) {
        var reviews = tree.select('reviews').get();

        tree.set('reviews', {
          reviews: reviews.reviews.concat(data.reviews),
          more: data.more,
          params: params,
          name: data.name,
          loaded: true,
          stats: data.stats,
        });
      }
      else {
        tree.set('reviews', data);
      }

      //TODO append reviews on "load more reviews"
    });
    //TODO catch errors
  },
};
