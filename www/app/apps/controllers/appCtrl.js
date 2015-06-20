'use strict';

angular.module('appstore').controller('appCtrl', function ($scope, $rootScope, $state, $timeout, $modal, $location, api, utils, lists, og) {
  $scope.name = $state.params.name;
  $scope.app_tab = 'desc';
  $scope.lists = [];
  $scope.appLists = [];
  $scope.listService = lists;
  $scope.app = null;

  $scope.strToColor = utils.strToColor;
  $scope.isFree = utils.isFree;
  $scope.appIcon = utils.appIcon;

  $scope.next_app = null;
  $scope.previous_app = null;
  var paging = api.get_last_page();
  api.next_app($scope.name, paging).then(function(app) {
    $scope.next_app = app;
  });
  api.previous_app($scope.name, paging).then(function(app) {
    $scope.previous_app = app;
  });

  utils.loading($scope);
  api.app($scope.name).then(function(app) {
    $scope.app = app;
    $scope.app.loading_reviews = true;

    var description = app.description; //TODO detect when this is the same as the title
    if (app.description && app.description.split('\n').length > 0) {
      description = app.description.split('\n')[0];
    }

    og.set(app.title, {
      description: description,
      image: utils.appIcon(app),
      url: '{url}app/' + app.name,
    });

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
  }).finally(function() {
    utils.doneLoading($scope);
  });

  function refreshLists() {
    var lists = [];
    var appLists = [];
    _.forEach($scope.listService.store, function(list) {
      if ($scope.app && list.packages.indexOf($scope.app.name) > -1) {
        appLists.push(list);
      }
      else {
        lists.push(list);
      }
    });

    $scope.lists = lists;
    $scope.appLists = appLists;
  }

  $scope.$watch('listService.store', refreshLists, true);

  $scope.addToList = function(listID) {
    lists.api.addApp(listID, $scope.app.name).then(function() {
      console.log('success');
      listID = null;
      $rootScope.setError('Added this app to your list', null, 'success');
    }, function(err) {
      console.error(err);
      $rootScope.setError('Could not add app to list at this time, please try again later');
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
    $scope.qrCodeTitle = $scope.app.title;
    $scope.qrCodeUrl = $location.absUrl();
    $modal.open({
      templateUrl: '/app/main/partials/qrcode.html',
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
