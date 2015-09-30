'use strict';

angular.module('appstore').directive('appView', function(utils, $state) {
  return {
    restrict: 'E',
    scope: {
      app: '=ngModel',
      showDescription: '@',
      link: '@',
      showPopularity: '@',
    },
    replace: true,
    templateUrl: '/app/apps/partials/appView.html',
    link: function($scope) {
      $scope.$state = $state;
      $scope.isFree = utils.isFree;
      $scope.appIcon = utils.appIcon;
    }
  };
});
