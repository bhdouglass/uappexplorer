'use strict';

angular.module('appstore').controller('meCtrl', function($scope, $rootScope, $location, $modal, gettextCatalog, auth, lists, utils) {
  $scope.strToColor = utils.strToColor;

  $scope.user = null;
  $scope.loading = false;
  $scope.lists = [];
  $scope.settings = {
    caxton_code: ''
  };

  utils.loading($scope);
  auth.login().then(function(user) {
    $scope.user = user;

    return lists.api.findAll();
  })
  .then(function(lists) {
    utils.doneLoading($scope);
    $scope.lists = lists;
  });

  $scope.icon = function(name) {
    var icon = 'fa-list-ul';
    name = name.toLowerCase();
    if (name.indexOf('favorite') > -1) {
      icon = 'fa-star';
    }
    else if (name.indexOf('love') > -1 || name.indexOf('heart') > -1) {
      icon = 'fa-heart';
    }

    return icon;
  };

  var modal = null;
  $scope.remove = function(list) {
    $scope.selectedList = list;

    modal = $modal.open({
      templateUrl: '/app/lists/partials/listDelete.html',
      scope: $scope
    });
  };

  $scope.delete = function(list) {
    utils.loading($scope);

    lists.api.delete(list._id).then(function() {
      modal.close();
      return lists.api.findAll();
    }, function(err) {
      console.error(err);
      $rootScope.setError(gettextCatalog.getString('Could not delete the list at this time, please try again later'));
    })
    .then(function(lists) {
      utils.doneLoading($scope);
      $scope.lists = lists;
    });
  };

  $scope.saveSettings = function() {
    if ($scope.settings.caxton_code) {
      auth.caxton_token($scope.settings.caxton_code).then(function(user) {
        $scope.user = user;
      }, function(err) {
        console.error(err);
        $rootScope.setError(gettextCatalog.getString('Could not save your settings at this time, please try again later'));
      });
    }
  };

  $scope.$on('$locationChangeStart', function() {
    if ($scope.user && $location.path() == '/me') {
      utils.loading($scope);

      lists.api.findAll().then(function(lists) {
        $scope.lists = lists;
      })
      .finally(function() {
        utils.doneLoading($scope);
      });
    }
  });
});
