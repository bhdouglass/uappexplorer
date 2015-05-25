'use strict';

angular.module('appstore').controller('meCtrl', function($scope, $rootScope, $location, auth) {
  $scope.user = null;

  auth.login().then(function(user) {
    $scope.user = user;
  });
});
