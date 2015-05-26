'use strict';

angular.module('appstore').factory('lists', function($http, $q, auth) {
  function addApp(listID, appName) {
    var list = null;
    _.forEach(service.store, function(l) {
      if (l._id == listID) {
        list = l;
      }
    });

    list.packages.push(appName);
    list.packages = _.uniq(list.packages);
    return service.api.update(listID, {packages: list.packages});
  }

  var service = {
    api: {
      findAll: function(user) { //TODO make this populate service.store
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
      },
      addApp: addApp
    },
    store: [],
  }
  var loggedin = false;

  auth.loggedin(function(user) {
    loggedin = !!user;

    if (loggedin) {
      service.api.findAll(user._id).then(function(lists) {
        service.store = lists;
      });
    }
    else {
      service.store = [];
    }
  });

  return service;
});
