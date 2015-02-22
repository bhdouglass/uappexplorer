app.controller('appsCtrl', function ($scope, $rootScope, $timeout, $state, api, utils) {
  console.log('loaded appsctrl');
  $scope.apps = [];
  $scope.app_count = 0;
  $scope.current_page = 0;
  $scope.pages = 0;
  $scope.loading = false;
  $scope.can_load = false;
  $scope.search = { //avoid 2-way binding issues
    q: '',
  };
  $scope.view = {
    style: 'grid',
  };
  $rootScope.app = null;

  $scope.types = {
    application: 'App',
    scope: 'Scope'
  };

  $scope.paging = {
    query: {},
    skip: 0,
    limit: 30,
    sort: '-published_date',
    mini: true,
  };

  function fetchApps() {
    utils.loading($scope);
    api.apps($scope.paging).then(function(data) {
      $scope.apps = data.apps;
      $scope.app_count = data.count;
      $scope.pages = Math.ceil($scope.app_count / $scope.paging.limit);

    }, function(err) {
      console.error(err);
      $rootScope.setError('Could not download app list, click to retry', fetchApps);
    }).finally(function() {
      utils.doneLoading($scope);
    });
  }

  $scope.$watch('paging', fetchApps, true);

  $scope.$watch('current_page', function() {
    $scope.paging.skip = $scope.current_page * $scope.paging.limit;
  });
});
