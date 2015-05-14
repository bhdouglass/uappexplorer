'use strict';

angular.module('appstore').directive('type', function() {
  return {
    restrict: 'E',
    scope: {
      model: '=ngModel'
    },
    replace: true,
    template: '<span class="label" ng-class="{' +
                '\'label-material-lightblue\': types[model] == \'App\',' +
                '\'label-material-cyan\': types[model] == \'Web App\',' +
                '\'label-material-orange\': types[model] == \'Scope\',' +
                '\'label-material-deeppurple\': types[model] == \'Snappy App\',' +
              '}" ng-bind="types[model]"></span>',
    link: function($scope) {
      $scope.types = {
        application: 'App',
        scope: 'Scope',
        webapp: 'Web App',
        snappy: 'Snappy App',
      };
    }
  };
});
