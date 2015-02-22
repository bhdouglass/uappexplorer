app.controller('indexCtrl', function ($scope, $rootScope, $state, $timeout, $location) {
  var title = 'Ubuntu Touch Apps';
  $scope.title = title;
  $scope.og = {};
  $scope.url = $location.protocol() + '://' + $location.host() + '/';
  $scope.$state = $state;

  $timeout(function() {
    $('.swipebox').swipebox();
  });

  $rootScope.dismissError = function() {
    $rootScope.error = '';
    if ($rootScope.errorCallback) {
      $rootScope.errorCallback();
      $rootScope.errorCallback = null;
    }
  };

  $rootScope.setError = function(error, errorCallback) {
    $rootScope.error = error;
    $rootScope.errorCallback = errorCallback;
  }

  $rootScope.$watch('app', function() {
    if ($rootScope.app) {
      $scope.title = $rootScope.app.title + ' - ' + title;

      var description = $rootScope.app.description;
      if ($rootScope.app.description && $rootScope.app.description.split('\n').length > 0) {
        description = $rootScope.app.description.split('\n')[0];
      }

      $scope.og = {
        title: $rootScope.app.title,
        description: description,
        image: $scope.url + 'api/icon/' + $rootScope.app.name + '.png',
        url: $scope.url + 'app/' + $rootScope.app.name,
      };
    }
    else {
      $scope.title = title;

      $scope.og = {
        title: title,
        description: 'Browse and discover apps for Ubuntu Touch',
        image: $scope.url + 'img/ubuntu-logo.png',
        url: $scope.url + 'apps',
      };
    }
  });
});
