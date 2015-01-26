'use strict';

app.directive('search', function($timeout, api) {
  return {
    restrict: 'E',
    scope: {
      paging: '=ngModel',
      search: '=search',
      errorCallback: '=errorCallback',
      count: '=count',
      view: '=view'
    },
    replace: true,
    templateUrl: '/app/partials/search.html',
    link: function($scope) {
      $scope.categories = [];
      $scope.category = {
        name: 'All Apps',
        internal_name: 'all',
      };
      $scope.frameworks = ['All'];
      $scope.more_filters = false;

      $scope.filters = {
        architecture: 'Any',
        framework: 'All',
      };

      $scope.sorts = [
        {
          label: 'Title A-Z',
          value: 'title'
        },
        {
          label: 'Title Z-A',
          value: '-title'
        },
        {
          label: 'Newest First',
          value: '-published_date'
        },
        {
          label: 'Oldest First',
          value: 'published_date'
        },
        {
          label: 'Highest Rated First',
          value: '-average_rating'
        },
        {
          label: 'Lowest Rated First',
          value: 'average_rating'
        },
        {
          label: 'Apps First',
          value: 'type'
        },
        {
          label: 'Scopes First',
          value: '-type'
        },
        {
          label: 'Free First',
          value: 'prices.USD'
        },
        {
          label: 'Most Expensive First (USD)',
          value: '-prices.USD'
        },
      ];

      $scope.architectures = ['Any', 'All', 'armhf', 'i386', 'x86_64'];

      function fetchCategories() {
        api.categories().then(function(data) {
          $scope.categories = data;
          $scope.category.name = $scope.categories[0].name;
          $scope.category.internal_name = $scope.categories[0].internal_name;
        }, function(err) {
          console.error(err);
          $scope.errorCallback('Could not download category list, click to retry', fetchCategories);
        });
      }
      fetchCategories();

      function fetchFrameworks() {
        api.frameworks().then(function(data) {
          $scope.frameworks = data;
          $scope.framework = $scope.frameworks[0];
        }, function(err) {
          console.error(err);
          $scope.errorCallback('Could not download framework list, click to retry', fetchFrameworks);
        });
      }
      fetchFrameworks();

      $scope.$watch('category.internal_name', function() {
        if ($scope.category.internal_name == 'all' || !$scope.category.internal_name) {
          $scope.paging.query.categories = undefined;
        }
        else {
          $scope.paging.query.categories = $scope.category.internal_name;
        }
      }, true);

      $scope.$watch('filters.architecture', function() {

        if (!$scope.filters.architecture || $scope.filters.architecture.toLowerCase() == 'any') {
          $scope.paging.query.architecture = undefined;
        }
        else {
          var architectures = [$scope.filters.architecture.toLowerCase()];
          if ($scope.filters.architecture.toLowerCase() != 'all') {
            architectures.push('all');
          }

          $scope.paging.query.architecture = {'_$in': architectures};
        }
      }, true);

      $scope.$watch('filters.framework', function() {
        if ($scope.filters.framework == 'All' || !$scope.filters.framework) {
          $scope.paging.query.framework = undefined;
        }
        else {
          var frameworks = [$scope.filters.framework];
          $scope.paging.query.framework = {'_$in': frameworks};
        }
      }, true);

      var timeout = null;
      $scope.$watch('search', function() {
        if ($scope.search) {
          if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
          }

          timeout = $timeout(function() {
            $scope.current_page = 0;
            $scope.paging.search = $scope.search;
            $scope.paging.skip = 0;
          }, 200);
        }
        else {
          $scope.paging.search = undefined;
        }
      });

      $scope.categoryName = function(value) {
        var name = 'Unknown';
        _.forEach($scope.categories, function(category) {
          if (category.internal_name == value) {
            name = category.name;
            return false;
          }
        });

        return name;
      };
    }
  };
});
