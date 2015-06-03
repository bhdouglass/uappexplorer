'use strict';

angular.module('appstore').controller('meCtrl', function($scope, $rootScope, $location, $timeout, $modal, auth, lists, utils, api) {
  $scope.sorts = utils.sorts;
  $scope.strToColor = utils.strToColor;

  $scope.user = null;
  $scope.loading = false;
  $scope.lists = [];
  $scope.apps = [];
  $scope.searchApps = [];
  $scope.search = '';
  $scope.appsError = false;
  $scope.searchError = false;

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
  };

  $scope.removeApp = function(appName) {
    var index = -1;
    _.forEach($scope.apps, function(app, i) {
      if (app.name == appName) {
        index = i;
        return false;
      }
    });

    if (index > -1) {
      $scope.apps.splice(index, 1);
    }

    var listIndex = $scope.selectedList.packages.indexOf(appName);
    if (listIndex > -1) {
      $scope.selectedList.packages.splice(listIndex, 1);
    }
  };

  $scope.addApp = function(app) {
    $scope.apps.push(app);
    $scope.selectedList.packages.push(app.name);
  };

  $scope.updateSearch = function(search) {
    $scope.search = search;
  };

  var searchTimeout = null;
  $scope.$watch('search', function() {
    if ($scope.search) {
      if (searchTimeout) {
        $timeout.cancel(searchTimeout);
        searchTimeout = null;
      }

      searchTimeout = $timeout(function() {
        $scope.searchError = false;
        api.apps({
          search: $scope.search,
          sort: $scope.selectedList.sort,
          mini: true,
          limit: 5,
        }).then(function(apps) {
          $scope.searchApps = apps.apps;
        }, function() {
          $scope.searchApps = [];
          $scope.searchError = true;
        });
      }, 300);
    }
    else {
      $scope.searchApps = [];
    }
  });

  var modal = null;
  $scope.edit = function(list) {
    $scope.selectedList = angular.copy(list);

    $scope.searchApps = [];
    $scope.apps = [];
    $scope.appsError = false;
    api.apps({
      query: {
        name: {$in: list.packages}
      },
      sort: list.sort,
      mini: true,
    }).then(function(apps) {
      $scope.apps = apps.apps;
    }, function() {
      $scope.appsError = true;
      $scope.apps = [];
    });

    modal = $modal.open({
      templateUrl: '/app/partials/listEdit.html',
      scope: $scope
    });
  };

  $scope.save = function(list) {
    if (list.name) {
      var update = !!list._id;
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
