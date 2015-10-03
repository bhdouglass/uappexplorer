'use strict';

angular.module('appstore').controller('listEditCtrl', function($scope, $timeout, $location, $rootScope, $state, gettextCatalog, lists, api, utils) {
  $scope.sorts = utils.getSorts();
  $scope.$on('gettextLanguageChanged', function() {
    $scope.sorts = utils.getSorts();
  });

  $scope.list = null;
  $scope.apps = [];
  $scope.searchApps = [];
  $scope.search = '';
  $scope.appsError = false;
  $scope.searchError = false;

  if ($state.params.id == 'new') {
    $scope.list = {
      name: '',
      sort: '-points',
      packages: [],
    };
  }
  else {
    lists.api.find($state.params.id).then(function(list) {
      $scope.list = list;

      if (list) {
        return api.apps({
          query: {
            name: {$in: list.packages}
          },
          sort: list.sort,
          mini: true,
        });
      }
      else {
        return $location.path('/me');
      }
    }).then(function(apps) {
      $scope.apps = apps;
    }, function() {
      $scope.appsError = true;
      $scope.apps = [];
    });
  }

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
        $scope.$dismiss('updated');
      }, function(err) {
        console.error(err);

        var message = gettextCatalog.getString('Could not create a new list at this time, please try again later');
        if (update) {
          message = gettextCatalog.getString('Could not update the list at this time, please try again later');
        }

        $rootScope.setError(message);
      })
      .finally(function() {
        utils.doneLoading($scope);
      });
    }
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

    var listIndex = $scope.list.packages.indexOf(appName);
    if (listIndex > -1) {
      $scope.list.packages.splice(listIndex, 1);
    }
  };

  $scope.addApp = function(app) {
    $scope.apps.push(app);
    $scope.list.packages.push(app.name);
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
          sort: $scope.list.sort,
          mini: true,
          limit: 5,
        }).then(function(apps) {
          $scope.searchApps = apps;
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
});
