'use strict';

angular.module('appstore').controller('listCtrl', function ($scope, $state, lists, api) {
  $scope.listID = $state.params.id;
  $scope.list = null;
  $scope.apps = [];
  $scope.view = 'grid';

  lists.api.find($scope.listID).then(function(list) {
    $scope.list = list;
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

  $scope.changeView = function(view) {
    $scope.view = view;
  }
});
