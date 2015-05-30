'use strict';

angular.module('appstore').controller('listCtrl', function ($scope, $rootScope, $state, $modal, $location, lists, api, auth, utils, og) {
  $scope.listID = $state.params.id;
  $scope.list = null;
  $scope.apps = [];
  $scope.view = 'grid';
  $scope.editable = false;
  $scope.user = null;
  $scope.loading = false;

  function checkEditable() {
    $scope.editable = ($scope.user && $scope.list && $scope.user._id == $scope.list.user);
  }

  auth.loggedin(function(user) {
    $scope.user = user;
    checkEditable();
  });

  function refreshList() {
    utils.loading($scope);
    lists.api.find($scope.listID).then(function(list) {
      if (list) {
        $scope.list = list;
        checkEditable();

        og.set('User List - ' + list.name, {
          description: 'User list by ' + list.user_name,
          url: '{url}list/' + list._id,
        });

        return api.apps({
          query: {
            name: {$in: list.packages}
          },
          mini: true,
        });
      }
      else {
        $rootScope.setError('Could not find this list, it may not exist any more', function() {
          $state.go('main');
        });

        return null;
      }
    }, function(err) {
      console.error(err);
      $rootScope.setError('Could not find this list, it may not exist any more', function() {
        $state.go('main');
      });

      return null;
    })
    .then(function(apps) {
      if (apps) {
        $scope.apps = apps.apps;
      }
    }, function(err) {
      console.error(err);
      $rootScope.setError('Could not load the apps for this list, please try again later', function() {
        $state.go('list', {id:  $state.params.id});
      });
    })
    .finally(function() {
      utils.doneLoading($scope);
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
      }, function(err) {
        console.error(err);
        $rootScope.setError('Could not remove the app from this list, please try again later');
      });
    }
  };

  $scope.qrCode = function() {
    $scope.qrCodeUrl = $location.absUrl();
    $modal.open({
      templateUrl: '/app/partials/qrcode.html',
      scope: $scope
    });
  };
});
