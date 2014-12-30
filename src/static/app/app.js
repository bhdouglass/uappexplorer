'use strict';

var app = angular.module('app', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/apps');

  $stateProvider.state('apps', {
    url: '/apps',
    templateUrl: '/app/partials/apps.html'
  }).state('app', {
    url: '/app/:name',
    templateUrl: '/app/partials/app.html'
  });
});

app.controller('indexCtrl', function ($scope, $http, $state, $timeout) {
  $scope.$state = $state;
  $scope.app_chunks = [];
  $scope.app = null;
  $scope.apps = [];
  $scope.app_count = 0;
  $scope.current_page = 0;
  $scope.pages = 0;
  $scope.categories = [];
  $scope.category = 'all';
  $scope.search = '';
  $scope.app_tab = 'desc';

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
  ];

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
    $http.get('/api/apps', {
      params: $scope.paging
    }).then(function(res) {
      $scope.apps = _.sortBy(res.data.data, $scope.paging.sort);

      if ($scope.$state.current.name == 'app') {
        $scope.select($scope.$state.params.name);
      }
    }, function(err) {
      //TODO error handling
    });

    $http.get('/api/apps?count=true', {
      params: $scope.paging
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
      var categories = [{label: 'All', value: 'all'}];
      _.forEach(res.data.data, function(category) {
        categories.push({
          label: category.charAt(0).toUpperCase() + category.slice(1),
          value: category
        });
      });

      $scope.categories = categories;
      $scope.category = $scope.categories[0].value;
    }, function(err) {
      //TODO error handling
    });
  }
  fetchCategories();

  $scope.$watch('category', function() {
    if ($scope.category == 'all' || !$scope.category) {
      $scope.paging.query.categories = undefined;
    }
    else {
      $scope.paging.query.categories = $scope.category;
    }
  }, true);

  $scope.$watch('current_page', function() {
    $scope.paging.skip = ($scope.current_page + 1) * $scope.paging.limit;
  });

  var timeout = null;
  $scope.$watch('search', function() {
    if ($scope.search) {
      if (timeout) {
        $timeout.cancel(timeout);
        timeout = null;
      }

      timeout = $timeout(function() {
        $scope.paging.search = $scope.search;
        $scope.paging.skip = 0;
      }, 200);
    }
    else {
      $scope.paging.search = undefined;
    }
  });

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
  });

  $scope.select = function(name) { //TODO cache this
    $scope.app_tab = 'desc';

    $http.get('/api/apps/' + name).then(function(res) {
      $scope.app = res.data.data;
    }, function(err) {
      //TODO error handling
      $scope.app = null;
    });
  };
});
