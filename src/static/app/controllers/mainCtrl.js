'use strict';

angular.module('appstore').controller('mainCtrl', function ($scope, $rootScope, api, utils) {
  $rootScope.app = null;
  $rootScope.back = {};
  $scope.popular = {};
  $scope.app_count = null;
  $scope.game_count = null;
  $scope.webapp_count = null;
  $scope.scope_count = null;
  $scope.appIcon = utils.appIcon;

  function refresh() {
    api.popular().then(function(data) {
      $scope.popular = data;
    }, function(err) {
      console.error(err);
      $rootScope.setError('Could not fetch popular app list, click to retry', refresh);
    });

    api.count({type: 'application'}).then(function(data) {
      $scope.app_count = data;
    });

    api.count({type: 'webapp'}).then(function(data) {
      $scope.webapp_count = data;
    });

    api.count({type: 'scope'}).then(function(data) {
      $scope.scope_count = data;
    });

    api.count({categories: 'games'}).then(function(data) {
      $scope.game_count = data;
    });
  }
  refresh();
});
