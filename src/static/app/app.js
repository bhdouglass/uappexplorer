'use strict';

var app = angular.module('app', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/apps');
  $locationProvider.html5Mode(true)

  $stateProvider.state('apps', {
    url: '/apps',
    templateUrl: '/app/partials/apps.html'
  }).state('app', {
    url: '/app/:name',
    templateUrl: '/app/partials/app.html'
  });
});

app.controller('indexCtrl', function ($scope, $http, $state, $timeout, $filter) {
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

  function fetchApps() {
    var paging = angular.copy($scope.paging);
    _.forEach(paging.query, function(q) {
      if (_.isObject(q) && q['_$in']) {
        q['$in'] = q['_$in'];
        q['_$in'] = undefined;
      }
    });

    $http.get('/api/apps', {
      params: paging
    }).then(function(res) {
      $scope.apps = _.sortBy(res.data.data, $scope.paging.sort);

      if ($scope.$state.current.name == 'app') {
        $scope.select($scope.$state.params.name);
      }
    }, function(err) {
      //TODO error handling
    });

    $http.get('/api/apps?count=true', {
      params: paging
    }).then(function(res) {
      $scope.app_count = res.data.data;

      $scope.pages = Math.ceil($scope.app_count / $scope.paging.limit);
    }, function(err) {
      //TODO error handling
    });
  }

  $scope.$watch('paging', fetchApps, true);

  function fetchCategories() {
    $http.get('/api/categories').then(function(res) {
      var categories = [{name: 'All', internal_name: 'all'}];
      _.forEach(res.data.data, function(category) {
        categories.push(category);
      });

      $scope.categories = categories;
      $scope.category = $scope.categories[0].internal_name;
    }, function(err) {
      //TODO error handling
    });
  }
  fetchCategories();

  function fetchFrameworks() {
    $http.get('/api/frameworks').then(function(res) {
      var frameworks = ['All'];
      _.forEach(res.data.data, function(framework) {
        frameworks.push(framework);
      });

      $scope.frameworks = frameworks;
      $scope.framework = $scope.frameworks[0];
    }, function(err) {
      //TODO error handling
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

  $scope.$watch('apps', function() {
    var app_chunks = [];
    _.forEach($scope.apps, function(app, index) {
      if (index % 3 == 0) {
        app_chunks.push([]);
      }

      app_chunks[app_chunks.length - 1].push(app);
    });

    $scope.app_chunks = app_chunks;
  });

  $scope.$on('$stateChangeSuccess', function() {
    if ($scope.$state.current.name == 'app') {
      $scope.select($scope.$state.params.name);
    }
    else {
      $scope.app = null;
    }
  });

  $scope.select = function(name) { //TODO cache this
    $scope.app_tab = 'desc';

    $http.get('/api/apps/' + name).then(function(res) {
      $scope.app = res.data.data;
      $scope.app.loading_reviews = true;

      $http.get('/api/apps/reviews/' + name).then(function(res) {
        if ($scope.app.name == res.data.data.name) {
          $scope.app.reviews = res.data.data.reviews;
        }
      }).finally(function() {
        $scope.app.loading_reviews = false;
      });
    }, function(err) {
      //TODO error handling
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

  //Adapted from http://stackoverflow.com/a/16348977
  $scope.strToColor = function(str, css) {
    str = str ? str : '';

    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    var color = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }

    var value = color;
    if (css) {
      value = {};
      value[css] = color;
    }

    return value;
  }

  $scope.isFree = function(prices) {
    return ($filter('dollars')(prices) == 'Free');
  };
});
