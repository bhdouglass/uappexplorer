'use strict';

app.directive('search', function($timeout, api) {
  return {
    restrict: 'E',
    scope: {
      paging: '=ngModel',
      search: '=search',
      errorCallback: '=errorCallback',
    },
    replace: true,
    templateUrl: '/app/partials/search.html',
    link: function($scope) {
      $scope.categories = [];
      $scope.category = 'all';
      $scope.architecture = 'Any';
      $scope.frameworks = ['All'];
      $scope.framework = 'All';
      $scope.search = '';
      $scope.more_filters = false;

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
          $scope.category = $scope.categories[0].internal_name;
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

      $scope.$watch('category', function() {
        if ($scope.category == 'all' || !$scope.category) {
          $scope.paging.query.categories = undefined;
        }
        else {
          $scope.paging.query.categories = $scope.category;
        }
      }, true);

      $scope.$watch('architecture', function() {
        if (!$scope.architecture || $scope.architecture.toLowerCase() == 'any') {
          $scope.paging.query.architecture = undefined;
        }
        else {
          var architectures = [$scope.architecture.toLowerCase()];
          if (architecture != 'all') {
            architectures.push('all');
          }

          $scope.paging.query.architecture = {'_$in': architectures};
        }
      }, true);

      $scope.$watch('framework', function() {
        if ($scope.framework == 'All' || !$scope.framework) {
          $scope.paging.query.framework = undefined;
        }
        else {
          var frameworks = [$scope.framework];
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
    }
  };
});
