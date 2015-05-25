'use strict';

angular.module('appstore').factory('auth', function($http, $location, $base64) {
  var currentUser = null;
  var loggedinCallbacks = [];
  //TODO save to cookie

  function executeCallbacks(user) {
    _.forEach(loggedinCallbacks, function(callback) {
      callback(user);
    });
  }

  function logout() {
    currentUser = null;
    executeCallbacks(currentUser);

    delete $http.defaults.headers.common.Authorization;
    $location.path('/auth/logout');
  }

  return {
    login: function() {
      return $http.get('/auth/me').then(function(res) {
        currentUser = res.data.data;
        $http.defaults.headers.common.Authorization = 'Basic ' + $base64.encode(currentUser.apikey + ':' + currentUser.apisecret);
        executeCallbacks(currentUser);

        return currentUser;
      }, function() {
        logout();

        return null;
      });
    },
    logout: logout,
    user: function() {
      return currentUser;
    },
    loggedin: function(callback) {
      loggedinCallbacks.push(callback);
    }
  };
});
