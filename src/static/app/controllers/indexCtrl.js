app.controller('indexCtrl', function ($scope, $http, $state, $timeout, $filter, api, utils) {
  var title = 'Ubuntu Touch Appstore (Unofficial)';
  $scope.title = title;
  $scope.$state = $state;
  $scope.app_chunks = [];
  $scope.app = null;
  $scope.apps = [];
  $scope.app_count = 0;
  $scope.current_page = 0;
  $scope.pages = 0;
  $scope.categories = [];
  $scope.category = 'all';
  $scope.architecture = 'Any';
  $scope.frameworks = ['All'];
  $scope.framework = 'All';
  $scope.search = '';
  $scope.app_tab = 'desc';
  $scope.more_filters = false;
  $scope.error = '';
  $scope.errorCallback = null;

  $timeout(function() {
    $('.fancybox').fancybox({loop: false});
  });

  $scope.sorts = [
    {
      label: 'Title A-Z',
      value: 'title'
    },
    {
      label: 'Title Z-A',
      value: '-title'
    },
    {
      label: 'Newest First',
      value: '-published_date'
    },
    {
      label: 'Oldest First',
      value: 'published_date'
    },
    {
      label: 'Highest Rated First',
      value: '-average_rating'
    },
    {
      label: 'Lowest Rated First',
      value: 'average_rating'
    },
    {
      label: 'Apps First',
      value: 'type'
    },
    {
      label: 'Scopes First',
      value: '-type'
    },
    {
      label: 'Free First',
      value: 'prices.USD'
    },
    {
      label: 'Most Expensive First (USD)',
      value: '-prices.USD'
    },
  ];

  $scope.architectures = ['Any', 'All', 'armhf', 'i386', 'x86_64'];

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
    console.log($scope.errorCallback);
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
      $scope.app_count = data.app_count;
      $scope.pages = Math.ceil($scope.app_count / $scope.paging.limit);

      if ($state.current.name == 'app') {
        $scope.select($state.params.name);
      }

    }, function(err) {
      console.error(err);
      $scope.error = 'Could not download app list, click to retry';
      $scope.errorCallback = fetchApps;
    });
  }

  $scope.$watch('paging', fetchApps, true);

  function fetchCategories() {
    api.categories().then(function(data) {
      $scope.categories = data;
      $scope.category = $scope.categories[0].internal_name;
    }, function(err) {
      console.error(err);
      $scope.error = 'Could not download category list, click to retry';
      $scope.errorCallback = fetchCategories;
    });
  }
  fetchCategories();

  function fetchFrameworks() {
    api.frameworks().then(function(data) {
      $scope.frameworks = data;
      $scope.framework = $scope.frameworks[0];
    }, function(err) {
      console.error(err);
      $scope.error = 'Could not download framework list, click to retry';
      $scope.errorCallback = fetchFrameworks;
    });
  }
  fetchFrameworks();

  $scope.$watch('category', function() {
    if ($scope.category == 'all' || !$scope.category) {
      $scope.paging.query.categories = undefined;
    }
    else {
      $scope.paging.query.categories = $scope.category;
    }
  }, true);

  $scope.$watch('architecture', function() {
    if (!$scope.architecture || $scope.architecture.toLowerCase() == 'any') {
      $scope.paging.query.architecture = undefined;
    }
    else {
      var architectures = [$scope.architecture.toLowerCase()];
      if (architecture != 'all') {
        architectures.push('all');
      }

      $scope.paging.query.architecture = {'_$in': architectures};
    }
  }, true);

  $scope.$watch('framework', function() {
    if ($scope.framework == 'All' || !$scope.framework) {
      $scope.paging.query.framework = undefined;
    }
    else {
      var frameworks = [$scope.framework];
      $scope.paging.query.framework = {'_$in': frameworks};
    }
  }, true);

  $scope.$watch('current_page', function() {
    $scope.paging.skip = $scope.current_page * $scope.paging.limit;
  });

  var timeout = null;
  $scope.$watch('search', function() {
    if ($scope.search) {
      if (timeout) {
        $timeout.cancel(timeout);
        timeout = null;
      }

      timeout = $timeout(function() {
        $scope.current_page = 0;
        $scope.paging.search = $scope.search;
        $scope.paging.skip = 0;
      }, 200);
    }
    else {
      $scope.paging.search = undefined;
    }
  });

  $scope.searchFor = function(search) {
    $scope.search = search;
    $state.go('apps');
  };

  $scope.$on('$stateChangeSuccess', function() {
    if ($scope.$state.current.name == 'app') {
      $scope.select($scope.$state.params.name);
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
        $scope.error = 'Could not find app ' + name;
        $scope.errorCallback = $scope.goToApps;
      }
      else {
        $scope.error = 'Could not download app data, click to retry';
        $scope.errorCallback = $scope.select;
      }

      $scope.app = null;
    });
  };

  $scope.$watch('app', function() {
    if ($scope.app) {
      $scope.title = $scope.app.title + ' - ' + title;
    }
    else {
      $scope.title = title;
    }
  });

  $scope.goToApps = function() {
    $state.go('apps');
  };

  $scope.strToColor = utils.strToColor;
  $scope.isFree = utils.isFree;
});
