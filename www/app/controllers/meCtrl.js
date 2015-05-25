'use strict';

angular.module('appstore').controller('meCtrl', function($scope, $rootScope, $location, auth, api, utils) {
  $scope.sorts = utils.sorts;
  $scope.user = null;
  $scope.working = true;
  $scope.lists = [];
  $scope.defaultNewList = {
    name: '',
    sort: '-points',
    packages: [],
  };
  $scope.newList = angular.copy($scope.defaultNewList);

  auth.login().then(function(user) {
    $scope.user = user;

    return api.lists.findAll($scope.user._id);
  })
  .then(function(lists) {
    $scope.working = false;
    $scope.lists = lists;
  });

  $scope.create = function(list) {
    $scope.working = true;

    api.lists.create(list).then(function() {
      $scope.newList = angular.copy($scope.defaultNewList);
      return api.lists.findAll($scope.user._id);
    }, function() {
      //TODO acutal error message
      console.log('could not create list');
    })
    .then(function(lists) {
      $scope.working = false;
      $scope.lists = lists;
    });
  };

  $scope.update = function(list) {
    $scope.working = true;

    api.lists.update(list._id, list).then(function() {
      return api.lists.findAll($scope.user._id);
    }, function() {
      //TODO acutal error message
      console.log('could not update list');
    })
    .then(function(lists) {
      $scope.working = false;
      $scope.lists = lists;
    });
  };

  $scope.delete = function(list) {
    $scope.working = true;

    api.lists.delete(list._id).then(function() {
      return api.lists.findAll($scope.user._id);
    }, function() {
      //TODO acutal error message
      console.log('could not update list');
    })
    .then(function(lists) {
      $scope.working = false;
      $scope.lists = lists;
    });
  };
});
