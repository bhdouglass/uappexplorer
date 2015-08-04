'use strict';

angular.module('appstore').directive('stars', function() {
  return {
    restrict: 'E',
    scope: {
      model: '=ngModel'
    },
    replace: true,
    template: '<span class="text-primary" title="{{stars}} / 5">' +
                '<span ng-repeat="f in full track by $index"><i class="fa fa-star"></i></span>' +
                '<span ng-repeat="h in half track by $index"><i class="fa fa-star-half-o"></i></span>' +
                '<span ng-repeat="e in empty track by $index"><i class="fa fa-star-o"></i></span>' +
              '</span>',
    link: function($scope) {
      $scope.full = [];
      $scope.half = [];
      $scope.empty = [];
      $scope.stars = 0;

      $scope.$watch('model', function() {
        var model = $scope.model === undefined ? 0 : $scope.model;
        $scope.stars = Math.round(model * 100) / 100;

        model = Math.round(model * 2) / 2; //round to nearest 1/2
        var full = Math.floor(model);
        var empty = 5 - Math.ceil(model);

        $scope.full = new Array(full);
        $scope.empty = new Array(empty);
        $scope.half = new Array(5 - full - empty);
      });
    }
  };
});
