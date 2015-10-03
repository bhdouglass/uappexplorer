'use strict';

angular.module('appstore').factory('auth', function($http, $location, $base64, ipCookie) {
  var currentUser = null;
  var loggedinCallbacks = [];

  function executeCallbacks(user) {
    _.forEach(loggedinCallbacks, function(callback) {
      callback(user);
    });
  }

  function logout() {
    currentUser = null;
    executeCallbacks(currentUser);
    ipCookie('authorization', null);

    delete $http.defaults.headers.common.Authorization;
    $location.path('/auth/logout');
  }

  function login() {
    return $http.get('/auth/me').then(function(res) {
      currentUser = res.data.data;
      var authorization = $base64.encode(currentUser.apikey + ':' + currentUser.apisecret);
      ipCookie('authorization', authorization, {expires: 6});

      $http.defaults.headers.common.Authorization = 'Basic ' + authorization;
      executeCallbacks(currentUser);

      return currentUser;
    }, function() {
      logout();

      return null;
    });
  }

  return {
    login: login,

    logout: logout,

    user: function() {
      return currentUser;
    },

    loggedin: function(callback) {
      callback(currentUser);
      loggedinCallbacks.push(callback);
    },

    check: function() {
      if (ipCookie('authorization')) {
        $http.defaults.headers.common.Authorization = 'Basic ' + ipCookie('authorization');
        login();
      }
    },

    caxton_token: function(code) {
      return $http.post('/auth/caxton/' + code).then(function() {
        return login();
      });
    },

    caxton_send: function(url, message) {
      return $http.post('/auth/caxton/send', {url: url, message: message});
    },

    set_language: function(language) {
      return $http.post('/auth/language/' + language).then(function() {
        console.log('Language settings saved');
      });
    },
  };
});
