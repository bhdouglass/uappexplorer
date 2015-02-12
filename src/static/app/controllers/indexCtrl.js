app.controller('indexCtrl', function ($scope, $http, $state, $timeout, $filter, $location, api, utils) {
  var title = 'Ubuntu Touch Apps';
  $scope.title = title;
  $scope.og = {};
  $scope.$state = $state;
  $scope.app = null;
  $scope.apps = [];
  $scope.app_count = 0;
  $scope.current_page = 0;
  $scope.pages = 0;
  $scope.app_tab = 'desc';
  $scope.error = '';
  $scope.errorCallback = null;
  $scope.loading = false;
  $scope.search = { //avoid 2-way binding issues
    q: '',
  };
  $scope.view = {
    style: 'grid',
  };
  $scope.url = $location.protocol() + '://' + $location.host() + '/';

  $timeout(function() {
    $('.swipebox').swipebox();
  });

  $scope.types = {
    application: 'App',
    scope: 'Scope'
  };

  $scope.paging = {
    query: {},
    skip: 0,
    limit: 30,
    sort: '-published_date',
    mini: true,
  };

  var can_load = false;
  function loading() {
    can_load = true;
    $scope.loading = false;
    $timeout(function() {
      if (can_load) {
        console.log('loading');
        $scope.loading = true;
      }
    }, 500); //0.5 seconds
  }

  function doneLoading() {
    can_load = false;
    $scope.loading = false;
  }

  $scope.dismissError = function() {
    $scope.error = '';
    if ($scope.errorCallback) {
      $scope.errorCallback();
      $scope.errorCallback = null;
    }
  };

  function fetchApps() {
    loading();
    api.apps($scope.paging).then(function(data) {
      $scope.apps = data.apps;
      $scope.app_count = data.count;
      $scope.pages = Math.ceil($scope.app_count / $scope.paging.limit);

      if ($state.current.name == 'app') {
        $scope.select($state.params.name);
      }

    }, function(err) {
      console.error(err);
      $scope.setError('Could not download app list, click to retry', fetchApps);
    }).finally(function() {
      doneLoading();
    });
  }

  $scope.$watch('paging', fetchApps, true);

  $scope.$watch('current_page', function() {
    $scope.paging.skip = $scope.current_page * $scope.paging.limit;
  });

  $scope.searchFor = function(search) {
    $scope.search.q = search;
    $scope.goToApps();
  };

  $scope.$on('$stateChangeSuccess', function() {
    if ($state.current.name == 'app') {
      $scope.select($state.params.name);
    }
    else {
      $scope.app = null;
    }
  });

  var last_name = name;
  $scope.select = function(name) { //TODO cache this
    if (!name) {
      name = last_name;
    }
    $scope.app_tab = 'desc';

    loading();
    api.app(name).then(function(data) {
      $scope.app = data;
    }, function(err) {
      console.error(err);
      if (err.status == 404) {
        $scope.setError('Could not find app ' + name, $scope.goToApps);
      }
      else {
        $scope.setError('Could not download app data, click to retry', $scope.select);
      }

      $scope.app = null;
    }).finally(function() {
      doneLoading();
    });
  };

  $scope.$watch('app', function() {
    if ($scope.app) {
      $scope.title = $scope.app.title + ' - ' + title;

      var description = $scope.app.description;
      if ($scope.app.description && $scope.app.description.split('\n').length > 0) {
        description = $scope.app.description.split('\n')[0];
      }

      $scope.og = {
        title: $scope.app.title,
        description: description,
        image: $scope.url + 'api/icon/' + $scope.app.name + '.png',
        url: $scope.url + 'app/' + $scope.app.name,
      };
    }
    else {
      $scope.title = title;

      $scope.og = {
        title: title,
        description: 'Browse and discover apps for Ubuntu Touch',
        image: $scope.url + 'img/ubuntu-logo.png',
        url: $scope.url + 'apps',
      };
    }
  });

  $scope.goToApps = function() {
    $state.go('apps');
  };

  $scope.strToColor = utils.strToColor;
  $scope.isFree = utils.isFree;
  $scope.setError = function(error, errorCallback) {
    $scope.error = error;
    $scope.errorCallback = errorCallback;
  }
});
