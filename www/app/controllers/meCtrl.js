'use strict';

angular.module('appstore').controller('meCtrl', function($scope, $rootScope, $location, $modal, auth, lists, utils) {
  $scope.sorts = utils.sorts;
  $scope.strToColor = utils.strToColor;

  $scope.user = null;
  $scope.loading = false;
  $scope.lists = [];

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

  $scope.newList = function() {
    return  {
      name: '',
      sort: '-points',
      packages: [],
    };
  }

  var modal = null;
  $scope.edit = function(list) {
    $scope.selectedList = angular.copy(list);
    modal = $modal.open({
      templateUrl: '/app/partials/listEdit.html',
      scope: $scope
    });
  };

  $scope.save = function(list) {
    if (list.name) {
      var update = !!list._id
      utils.loading($scope);

      var promise = null;
      if (update) {
        promise = lists.api.update(list._id, list);
      }
      else {
        promise = lists.api.create(list);
      }

      promise.then(function() {
        modal.close();
        return lists.api.findAll();
      }, function(err) {
        console.error(err);

        var message = 'Could not create a new list at this time, please try again later';
        if (update) {
          message = 'Could not update the list at this time, please try again later';
        }

        $rootScope.setError(message);
      })
      .then(function(lists) {
        utils.doneLoading($scope);
        $scope.lists = lists;
      });
    }
  };

  $scope.remove = function(list) {
    $scope.selectedList = list;

    modal = $modal.open({
      templateUrl: '/app/partials/listDelete.html',
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
      $rootScope.setError('Could not delete the list at this time, please try again later');
    })
    .then(function(lists) {
      utils.doneLoading($scope);
      $scope.lists = lists;
    });
  };
});
