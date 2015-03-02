'use strict';

angular.module('appstore').controller('mainCtrl', function ($scope, $rootScope, api) {
  $rootScope.app = null;
  $rootScope.back = {};
  $scope.popular = {};
  $scope.app_count = null;
  $scope.game_count = null;

  function refresh() {
    api.popular().then(function(data) {
      $scope.popular = data;
    }, function(err) {
      console.error(err);
      $rootScope.setError('Could not fetch popular app list, click to retry', refresh);
    });

    api.count().then(function(data) {
      $scope.app_count = data;
    });

    api.count({categories: 'games'}).then(function(data) {
      $scope.game_count = data;
    });
  }
  refresh();
});
