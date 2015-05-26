'use strict';

angular.module('appstore').controller('listCtrl', function ($scope, $state, lists, api, auth) {
  $scope.listID = $state.params.id;
  $scope.list = null;
  $scope.apps = [];
  $scope.view = 'grid';
  $scope.editable = false;
  $scope.user = null;

  function checkEditable() {
    $scope.editable = ($scope.user && $scope.list && $scope.user._id == $scope.list.user);
  }

  auth.loggedin(function(user) {
    $scope.user = user;
    checkEditable();
  });

  function refreshList() {
    lists.api.find($scope.listID).then(function(list) {
      $scope.list = list;
      checkEditable();

      return api.apps({
        query: {
          name: {$in: list.packages}
        },
        mini: true,
      });
    }, function() {
      console.log('list not found');
      //TODO failure message
      return null;
    })
    .then(function(apps) {
      if (apps) {
        $scope.apps = apps.apps;
      }
    }, function() {
      console.log('apps failed');
      //TODO failure message
    });
  }
  refreshList();

  $scope.changeView = function(view) {
    $scope.view = view;
  };

  $scope.removeApp = function(appName) {
    if ($scope.editable) {
      lists.api.removeApp($scope.list._id, appName).then(function() {
        console.log('removed app');
        refreshList();
      }, function() {
        console.log('failed to remove app');
        //TODO error message
      });
    }
  };
});
