'use strict';

angular.module('appstore').controller('appCtrl', function ($scope, $rootScope, $state, $timeout, $modal, $location, api, utils, lists) {
  $scope.name = $state.params.name;
  $scope.app_tab = 'desc';
  $scope.lists = [];
  $scope.listService = lists;
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

    refreshLists();

    api.reviews($scope.app.name, 9).then(function(data) {
      if ($scope.app.name == data.name) {
        $scope.app.reviews = data.reviews;
        $scope.app.review_stats = data.stats;
        $scope.app.more_reviews = data.more;
      }
    }).finally(function() {
      $scope.app.loading_reviews = false;
    });
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

  function refreshLists() {
    var lists = [];
    _.forEach($scope.listService.store, function(list) {
      if (!$scope.app || list.packages.indexOf($scope.app.name) == -1) {
        lists.push(list);
      }
    });
    $scope.lists = lists;
  }

  $scope.$watch('listService.store', refreshLists, true);

  $scope.addToList = function(listID) {
    lists.api.addApp(listID, $scope.app.name).then(function() {
      console.log('success');
      //TODO success message
    }, function() {
      //TODO fail message
      console.log('fail');
    });
  };

  $scope.loadMoreReview = function(app) {
    app.loading_more_reivews = true;
    api.reviews(app.name).then(function(data) {
      app.reviews = data.reviews;
      app.more_reviews = false;
    }).finally(function() {
      app.loading_more_reivews = false;
    });
  };

  $scope.qrCode = function() {
    $scope.qrCodeUrl = $location.absUrl();
    $modal.open({
      templateUrl: '/app/partials/qrcode.html',
      scope: $scope
    });
  };

  $scope.stats = function(rating) {
    var width = 0;
    if ($scope.app && $scope.app.review_stats && $scope.app.review_stats.total > 0) {
      width = $scope.app.review_stats[rating] / $scope.app.review_stats.total * 100;
    }

    var style = {
      width: width + '%'
    };

    if ($scope.app && $scope.app.review_stats && $scope.app && $scope.app.review_stats[rating] === 0) {
      style.display = 'none';
    }

    return style;
  };
});
