'use strict';

angular.module('appstore').directive('appView', function(utils, $state) {
  return {
    restrict: 'E',
    scope: {
      app: '=ngModel',
      showDescription: '@',
      link: '@'
    },
    replace: true,
    templateUrl: '/app/partials/appView.html',
    link: function($scope) {
      $scope.$state = $state;
      $scope.isFree = utils.isFree;
      $scope.appIcon = utils.appIcon;
    }
  };
});
