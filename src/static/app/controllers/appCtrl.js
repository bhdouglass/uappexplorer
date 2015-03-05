'use strict';

angular.module('appstore').controller('appCtrl', function ($scope, $rootScope, $state, $timeout, api, utils) {
  $scope.name = $state.params.name;
  $scope.app_tab = 'desc';
  $scope.app = null;
  $rootScope.app = null;
  $scope.strToColor = utils.strToColor;
  $scope.isFree = utils.isFree;
  $scope.appIcon = utils.appIcon;

  utils.loading($scope);
  api.app($scope.name).then(function(data) {
    $scope.app = data;
    $rootScope.app = data;
    $scope.app.loading_reviews = true;

    api.reviews($scope.app.name, 9).then(function(data) {
      if ($scope.app.name == data.name) {
        $scope.app.reviews = data.reviews;
        $scope.app.more_reviews = data.more;
      }
    }).finally(function() {
      $scope.app.loading_reviews = false;
    });;
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

  $scope.loadMoreReview = function(app) {
    app.loading_more_reivews = true;
    api.reviews(app.name).then(function(data) {
      app.reviews = data.reviews;
      app.more_reviews = false;
    }).finally(function() {
      app.loading_more_reivews = false;
    });
  };
});
