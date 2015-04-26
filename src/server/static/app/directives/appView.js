'use strict';

angular.module('appstore').directive('appView', function(utils) {
  return {
    restrict: 'E',
    scope: {
      app: '=ngModel',
      showDescription: '@'
    },
    replace: true,
    templateUrl: '/app/partials/appView.html',
    link: function($scope) {
      $scope.isFree = utils.isFree;
      $scope.appIcon = utils.appIcon;
    }
  };
});
