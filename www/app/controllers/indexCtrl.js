'use strict';

angular.module('appstore').controller('indexCtrl', function ($scope, $rootScope, $state, $timeout, $location, $modal, ipCookie, utils, auth) {
  var title = 'uApp Explorer';
  $scope.title = title;
  $scope.og = {};
  $scope.url = $location.protocol() + '://' + $location.host() + '/';
  $scope.$state = $state;
  $rootScope.loggedin = false;

  $timeout(function() {
    $('.swipebox').swipebox();
  });

  $rootScope.dismissError = function() {
    $rootScope.error = '';
    if ($rootScope.errorCallback) {
      $rootScope.errorCallback();
      $rootScope.errorCallback = null;
    }
  };

  $rootScope.setError = function(error, errorCallback, errorClass) { //TODO refactor these var/fn names
    $rootScope.error = error;
    $rootScope.errorCallback = errorCallback;
    $rootScope.errorClass = errorClass;
  };

  $rootScope.$watch('app', function() {
    if ($rootScope.app) {
      $scope.title = $rootScope.app.title + ' - ' + title;

      var description = $rootScope.app.description;
      if ($rootScope.app.description && $rootScope.app.description.split('\n').length > 0) {
        description = $rootScope.app.description.split('\n')[0];
      }

      $scope.og = {
        title: $rootScope.app.title,
        description: description,
        image: utils.appIcon($rootScope.app),
        url: $scope.url + 'app/' + $rootScope.app.name,
      };
    }
    else {
      $scope.title = title;

      $scope.og = {
        title: title,
        description: 'Browse and discover apps for Ubuntu Touch',
        image: $scope.url + 'img/logo.png',
        url: $scope.url + 'apps',
      };
    }
  });

  $scope.faq = function() {
    $modal.open({
      templateUrl: '/app/partials/faq.html'
    });
  };

  $rootScope.donate = function() {
    $modal.open({
      templateUrl: '/app/partials/donate.html'
    });
  };

  $rootScope.login = function() {
    $modal.open({
      templateUrl: '/app/partials/login.html'
    });
  };

  $rootScope.logout = function() {
    auth.logout();
  };

  auth.loggedin(function(user) {
    $rootScope.loggedin = !!user;
  });

  $timeout(function() {
    if (!ipCookie('disclaimer')) {
      $modal.open({
        templateUrl: '/app/partials/disclaimer.html'
      });

      var now = new Date();
      ipCookie('disclaimer', Math.floor(now.getTime() / 1000), {expires: 365});
    }

    auth.check();
  });
});
