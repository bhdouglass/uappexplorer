'use strict';

angular.module('appstore').controller('mainCtrl', function ($scope, $rootScope, api, utils) {
  $rootScope.app = null;
  $rootScope.back = {};
  $scope.popular = {};
  $scope.counts = {
    applications: null,
    webapps: null,
    scopes: null,
    games: null,
  };
  $scope.appIcon = utils.appIcon;

  function refresh() {
    api.popular().then(function(data) {
      $scope.popular = data;
    }, function(err) {
      console.error(err);
      $rootScope.setError('Could not fetch popular app list, click to retry', refresh);
    });

    api.counts().then(function(data) {
      $scope.counts = data;
    });
  }
  refresh();
});
