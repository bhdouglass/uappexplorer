'use strict';

angular.module('appstore').controller('indexCtrl', function ($scope, $rootScope, $state, $timeout, $location, $modal, ipCookie, utils) {
  var title = 'uApp Explorer';
  $scope.title = title;
  $scope.og = {};
  $scope.url = $location.protocol() + '://' + $location.host() + '/';
  $scope.$state = $state;

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

  $rootScope.setError = function(error, errorCallback) {
    $rootScope.error = error;
    $rootScope.errorCallback = errorCallback;
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
        image: $scope.url + 'img/ubuntu-logo.png',
        url: $scope.url + 'apps',
      };
    }
  });

  $scope.faq = function() {
    $modal.open({
      templateUrl: '/app/partials/faq.html'
    });
  };

  if (!ipCookie('disclaimer')) {
    $modal.open({
      templateUrl: '/app/partials/disclaimer.html'
    });

    var now = new Date();
    ipCookie('disclaimer', Math.floor(now.getTime() / 1000), {expires: 365});
  }
});
