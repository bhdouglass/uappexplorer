app.controller('appCtrl', function ($scope, $rootScope, $state, $timeout, api, utils) {
  $scope.name = $state.params.name;
  $scope.app_tab = 'desc';
  $scope.app = null;
  $rootScope.app = null;
  $scope.strToColor = utils.strToColor;
  $scope.isFree = utils.isFree;

  utils.loading($scope);
  api.app($scope.name).then(function(data) {
    $scope.app = data;
    $rootScope.app = data;
  }, function(err) {
    console.error(err);
    if (err.status == 404) {
      $rootScope.setError('Could not find app ' + $scope.name, function() {
        $state.go('apps');
      });
    }
    else {
      $rootScope.setError('Could not download app data, click to retry', function() {
        $state.go('app', {name: $scope.name}, {reload: true});
      });
    }

    $scope.app = null;
    $rootScope.app = null;
  }).finally(function() {
    utils.doneLoading($scope);
  });
});
