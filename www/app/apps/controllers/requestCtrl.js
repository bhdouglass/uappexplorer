'use strict';

angular.module('appstore').controller('requestCtrl', function ($scope, api) {
  $scope.success = null;
  $scope.appName = null;

  $scope.find = function(name) {
    $scope.success = null;

    api.find(name).then(function(data) {
      $scope.success = true;
      $scope.appName = data.name;
    }, function() {
      $scope.success = false;
    });
  };
});
