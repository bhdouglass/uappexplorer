'use strict';

angular.module('appstore').factory('api', function($q, $http) {
  return {
    apps: function(paging, canceler) {
      paging = angular.copy(paging);
      _.forEach(paging.query, function(q) {
        if (_.isObject(q) && q._$in) {
          q.$in = q._$in;
          q._$in = undefined;
        }
      });

      var options = {
        params: paging
      };

      if (canceler) {
        options.timeout = canceler.promise;
      }

      var apps_deferred = $q.defer();
      $http.get('/api/apps', options).then(function(res) {
        var apps = _.sortBy(res.data.data, paging.sort);
        apps_deferred.resolve(apps);
      }, function(err) {
        apps_deferred.reject(err);
      });

      var count_deferred = $q.defer();
      $http.get('/api/apps?count=true', options).then(function(res) {
        var app_count = res.data.data;
        count_deferred.resolve(app_count);
      }, function(err) {
        count_deferred.reject(err);
      });

      return $q.all({
        'apps': apps_deferred.promise,
        'count': count_deferred.promise,
      });
    },

    count: function(query) {
      var count_deferred = $q.defer();
      $http.get('/api/apps?count=true', {
        params: {
          query: query
        }
      }).then(function(res) {
        var app_count = res.data.data;
        count_deferred.resolve(app_count);
      }, function(err) {
        count_deferred.reject(err);
      });

      return count_deferred.promise;
    },

    categories: function() {
      var deferred = $q.defer();
      $http.get('/api/categories').then(function(res) {
        var categories = [{name: 'All Apps', internal_name: 'all'}];
        _.forEach(res.data.data, function(category) {
          categories.push(category);
        });

        deferred.resolve(categories);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    frameworks: function() {
      var deferred = $q.defer();
      $http.get('/api/frameworks').then(function(res) {
        var frameworks = ['All'];
        _.forEach(res.data.data, function(framework) {
          frameworks.push(framework);
        });

        deferred.resolve(frameworks);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    licenses: function() {
      var deferred = $q.defer();
      $http.get('/api/licenses').then(function(res) {
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

        deferred.resolve(licenses);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    app: function(name) {
      var deferred = $q.defer();
      $http.get('/api/apps/' + name).then(function(res) {
        var app = res.data.data;


        deferred.resolve(app);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    reviews: function(name, limit, skip) {
      var deferred = $q.defer();
      $http.get('/api/apps/reviews/' + name, {
        params: {
          limit: limit,
          skip: skip
        }
      }).then(function(res) {
        deferred.resolve(res.data.data);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    popular: function() {
      var deferred = $q.defer();
      $http.get('/api/apps/popular').then(function(res) {
        deferred.resolve(res.data.data);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    counts: function() {
      var deferred = $q.defer();
      $http.get('/api/apps/counts').then(function(res) {
        deferred.resolve(res.data.data);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    essentials: function() {
      var deferred = $q.defer();
      $http.get('/api/apps/essentials').then(function(res) {
        deferred.resolve(res.data.data);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    find: function(name) {
      var deferred = $q.defer();
      $http.get('/api/apps/find/' + name).then(function(res) {
        deferred.resolve(res.data.data);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    lists: {
      findAll: function(user) {
        return $http.get('/api/lists', {
          data: {
            user: user
          }
        })
        .then(function(res) {
          return res.data.data;
        }, function() {
          return [];
        });
      },
      find: function(id) {
        return $http.get('/api/lists/' + id).then(function(res) {
          return res.data.data;
        }, function() {
          return null;
        });
      },
      create: function(list) {
        delete list.user;
        delete list.user_name;

        return $http({
          url: '/api/lists',
          method: 'POST',
          data: list,
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(function(res) {
          return res.data.data;
        }, function() {
          return null;
        });
      },
      update: function(id, list) {
        delete list.user;
        delete list.user_name;

        return $http({
          url: '/api/lists/' + id,
          method: 'PUT',
          data: list,
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(function(res) {
          return res.data.data;
        }, function() {
          return null;
        });
      },
      delete: function(id) {
        return $http.delete('/api/lists/' + id).then(function() {
          return true;
        }, function() {
          return false;
        });
      }
    }
  };
});
