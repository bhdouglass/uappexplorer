'use strict';

app.directive('pagination', function() {
  return {
    restrict: 'E',
    scope: {
      current: '=ngModel',
      pages: '=pages'
    },
    replace: true,
    templateUrl: '/app/partials/pagination.html',
    link: function($scope) {
      $scope.pages_repeater = [];

      function updatePaging() {
        var pages_repeater = [];
        var start = $scope.current - 1;
        if (start < 0) {
          start = 0;
        }

        if (start + 3 > $scope.pages) {
          start - $scope.pages - 3;
        }

        for (var i = start; i < $scope.pages && i < start + 3; i++) {
          pages_repeater.push(i);
        }
        $scope.pages_repeater = pages_repeater;
      }

      $scope.page = function(index) {
        $scope.current = index;
      };

      $scope.previous_page = function() {
        $scope.current--;

        if ($scope.current < 0) {
          $scope.current = 0;
        }

        $scope.page($scope.current);
      };

      $scope.next_page = function() {
        $scope.current++;

        if ($scope.current >= $scope.pages) {
          $scope.current = $scope.pages - 1;
        }

        $scope.page($scope.current);
      };

      $scope.$watch('current', updatePaging);
      $scope.$watch('pages', updatePaging);
    }
  };
});
