app.controller('indexCtrl', function ($scope, $http, $state, $timeout, $filter, api, utils) {
  var title = 'Ubuntu Touch Appstore (Unofficial)';
  $scope.title = title;
  $scope.page_description = title;
  $scope.og = {};
  $scope.$state = $state;
  $scope.app_chunks = [];
  $scope.app = null;
  $scope.apps = [];
  $scope.app_count = 0;
  $scope.current_page = 0;
  $scope.pages = 0;
  $scope.app_tab = 'desc';
  $scope.error = '';
  $scope.errorCallback = null;

  $timeout(function() {
    $('.fancybox').fancybox({loop: false});
  });

  $scope.types = {
    application: 'App',
    scope: 'Scope'
  };

  $scope.paging = {
    query: {},
    skip: 0,
    limit: 30,
    sort: 'title',
    mini: true,
  };

  $scope.dismissError = function() {
    $scope.error = '';
    if ($scope.errorCallback) {
      $scope.errorCallback();
      $scope.errorCallback = null;
    }
  };

  function fetchApps() {
    api.apps($scope.paging).then(function(data) {
      $scope.apps = data.apps;
      var app_chunks = [];
      _.forEach($scope.apps, function(app, index) {
        if (index % 3 == 0) {
          app_chunks.push([]);
        }

        app_chunks[app_chunks.length - 1].push(app);
      });

      $scope.app_chunks = app_chunks;
      $scope.app_count = data.count;
      $scope.pages = Math.ceil($scope.app_count / $scope.paging.limit);

      if ($state.current.name == 'app') {
        $scope.select($state.params.name);
      }

    }, function(err) {
      console.error(err);
      $scope.setError('Could not download app list, click to retry', fetchApps);
    });
  }

  $scope.$watch('paging', fetchApps, true);

  $scope.$watch('current_page', function() {
    $scope.paging.skip = $scope.current_page * $scope.paging.limit;
  });

  $scope.searchFor = function(search) {
    $scope.search = search;
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
    });
  };

  $scope.$watch('app', function() {
    if ($scope.app) {
      $scope.title = $scope.app.title + ' - ' + title;
      $scope.page_description = title + ' - ' + $scope.app.title;

      var description = $scope.app.description;
      if ($scope.app.description && $scope.app.description.split('\n').length > 0) {
        description = $scope.app.description.split('\n')[0];
      }

      $scope.og = {
        title: $scope.app.title,
        description: description,
        image: 'http://appstore.bhdouglass.com/images/' + $scope.app.icon_filename,
        url: 'http://appstore.bhdouglass.com/app/' + $scope.app.name,
      };
    }
    else {
      $scope.title = title;
      $scope.page_description = title;

      $scope.og = {
        title: title,
        description: 'Browse and discover apps for Ubuntu Touch',
        image: 'http://appstore.bhdouglass.com/img/ubuntu-logo.png',
        url: 'http://appstore.bhdouglass.com/apps',
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
