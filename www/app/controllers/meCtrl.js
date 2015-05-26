'use strict';

angular.module('appstore').controller('meCtrl', function($scope, $rootScope, $location, auth, lists, utils) {
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

    return lists.api.findAll();
  })
  .then(function(lists) {
    $scope.working = false;
    $scope.lists = lists;
  });

  $scope.create = function(list) {
    $scope.working = true;

    lists.api.create(list).then(function() {
      $scope.newList = angular.copy($scope.defaultNewList);
      return lists.api.findAll();
    }, function(err) {
      console.error(err);
      $rootScope.setError('Could not create a new list at this time, please try again later');
    })
    .then(function(lists) {
      $scope.working = false;
      $scope.lists = lists;
    });
  };

  $scope.update = function(list) {
    $scope.working = true;

    lists.api.update(list._id, list).then(function() {
      return lists.api.findAll();
    }, function(err) {
      console.error(err);
      $rootScope.setError('Could not update the list at this time, please try again later');
    })
    .then(function(lists) {
      $scope.working = false;
      $scope.lists = lists;
    });
  };

  $scope.delete = function(list) {
    $scope.working = true;

    lists.api.delete(list._id).then(function() {
      return lists.api.findAll();
    }, function(err) {
      console.error(err);
      $rootScope.setError('Could not delete the list at this time, please try again later');
    })
    .then(function(lists) {
      $scope.working = false;
      $scope.lists = lists;
    });
  };
});