'use strict';

angular.module('appstore').factory('api', function($q, $http) {
  var last_page = {
    query: {},
    skip: 0,
    limit: 30,
    sort: '-published_date',
    mini: true,
  }; //TODO store this in local storage
  var last_requested_page = angular.copy(last_page);
  var app_cache = {};

  function apps_cache_fetch(paging) {
    var data = null;
    var cache_key = JSON.stringify(paging);
    if (app_cache[cache_key]) {
      var now = moment();
      if (now.diff(app_cache[cache_key].date, 'minutes') <= 60) {
        data = app_cache[cache_key].data;
      }
    }

    return data;
  }

  function next_previous_app(name, paging, direction) {
    return apps(paging).then(function(data) {
      var app = null;
      var appIndex = null;
      _.forEach(data, function(app, index) {
        if (app.name == name) {
          appIndex = index + direction;
          return false;
        }
      });

      if (appIndex === null) {
        app = null;
      }
      else if (appIndex >= data.length) {
        paging.skip += paging.limit;
        app = apps(paging, null, true);
      }
      else if (appIndex < 0) {
        if (paging.skip === 0) {
          app = null; //No previous pages to get
        }
        else {
          paging.skip -= paging.limit;
          if (paging.skip >= 0) {
            app = apps(paging, null, true);
          }
          else {
            app = null;
          }
        }
      }
      else {
        app = data[appIndex];
      }

      return app;
    }).then(function(appOrApps) {
      var app = null;
      if (_.isArray(appOrApps)) {
        var data = appOrApps;
        if (data.length === 0) {
          app = null;
        }
        else if (direction == 1) {
          app = data[0];
        }
        else if (direction == -1) {
          app = data[data.length - 1];
        }

        if (app) {
          app.different_page = true;
        }
      }
      else {
        app = appOrApps;
      }

      return app;
    });
  }

  function apps(paging, canceler, dontSaveLastPage) {
    var promise = null;
    var p = angular.copy(paging);
    last_requested_page = angular.copy(paging);

    if (!dontSaveLastPage) {
      last_page = angular.copy(paging);
    }

    var cache_key = JSON.stringify(p);
    var cachedData = apps_cache_fetch(p);
    if (cachedData !== null) {
      promise = $q.when(cachedData);
    }

    if (!promise) {
      _.forEach(p.query, function(q) {
        if (_.isObject(q) && q._$in) {
          q.$in = q._$in;
          q._$in = undefined;
        }
      });

      var options = {
        params: p
      };

      if (canceler) {
        options.timeout = canceler.promise;
      }

      promise = $http.get('/api/apps', options).then(function(res) {
        var apps = _.sortBy(res.data.data, p.sort);

        app_cache[cache_key] = {
          data: apps,
          date: moment(),
        };

        return apps;
      });
    }

    return promise;
  }

  return {
    apps: apps,

    count: function(paging, canceler) {
      var p = angular.copy(paging);
      _.forEach(p.query, function(q) {
        if (_.isObject(q) && q._$in) {
          q.$in = q._$in;
          q._$in = undefined;
        }
      });

      var options = {
        params: p
      };

      if (canceler) {
        options.timeout = canceler.promise;
      }

      return $http.get('/api/apps?count=true', options).then(function(res) {
        return res.data.data;
      });
    },

    get_last_page: function() {
      return angular.copy(last_page);
    },

    set_last_page: function(paging){
      if (!paging) {
        paging = last_requested_page;
      }

      last_page = angular.copy(paging);
    },

    //TODO cache this in local storage
    categories: function() {
      return $http.get('/api/categories').then(function(res) {
        var categories = [{name: 'All Apps', internal_name: 'all'}];
        _.forEach(res.data.data, function(category) {
          categories.push(category);
        });

        return categories;
      });
    },

    //TODO cache this in local storage
    frameworks: function() {
      return $http.get('/api/frameworks').then(function(res) {
        var frameworks = ['All'];
        _.forEach(res.data.data, function(framework) {
          frameworks.push(framework);
        });

        return frameworks;
      });
    },

    //TODO cache this in local storage
    licenses: function() {
      return $http.get('/api/licenses').then(function(res) {
        var licenses = [
          {label: 'Open Source', value: 'open_source'},
          {label: 'Proprietary', value: 'proprietary'}
        ];

        _.forEach(res.data.data, function(license) {
          licenses.push({
            label: license,
            value: license.replace(/ /g, '_').replace(/\//g, '_').toLowerCase()
          });
        });

        return licenses;
      });
    },

    app: function(name) {
      return $http.get('/api/apps/' + name).then(function(res) {
        return res.data.data;
      });
    },

    next_app: function(name, paging) {
      return next_previous_app(name, angular.copy(paging), 1);
    },

    previous_app: function(name, paging) {
      return next_previous_app(name, angular.copy(paging), -1);
    },

    reviews: function(name, limit, skip) {
      return $http.get('/api/apps/reviews/' + name, {
        params: {
          limit: limit,
          skip: skip
        }
      }).then(function(res) {
        return res.data.data;
      });
    },

    popular: function() {
      return $http.get('/api/apps/popular').then(function(res) {
        return res.data.data;
      });
    },

    counts: function() {
      return $http.get('/api/apps/counts').then(function(res) {
        return res.data.data;
      });
    },

    essentials: function() {
      return $http.get('/api/apps/essentials').then(function(res) {
        return res.data.data;
      });
    },

    find: function(name) {
      return $http.get('/api/apps/find/' + name).then(function(res) {
        return res.data.data;
      });
    },
  };
});
