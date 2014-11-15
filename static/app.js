var app = angular.module('app', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/apps');

  $stateProvider.state('apps', {
    url: '/apps',
    templateUrl: '/apps.html'
  }).state('app', {
    url: '/app/:name',
    templateUrl: 'app.html'
  });
});

app.controller('indexCtrl', function ($scope, $http, $state) {
  $scope.$state = $state;
  $scope.app_chunks = [];
  $scope.app = null;
  $scope.apps = null;
  $scope.app_count = 0;
  $scope.pages = 1;
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
      value: 'published_date'
    },
    {
      label: 'Oldest First',
      value: '-published_date'
    }
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
    mini: true
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
      $scope.pages = new Array(Math.ceil($scope.app_count / $scope.paging.limit));
    }, function(err) {
      //TODO error handling
    });
  }

  $scope.$watch('paging', fetchApps, true);
  $scope.page = function(index) {
    $scope.paging.skip = index * $scope.paging.limit;
  };

  $scope.$watch('apps', function() {
    var app_chunks = [];
    _.forEach($scope.apps, function(app, index) {
      if (index % 6 == 0) {
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

  $scope.select = function(name) { //TODO pull from api
    $http.get('/api/apps/' + name).then(function(res) {
      $scope.app = res.data.data;
    }, function(err) {
      //TODO error handling
      $scope.app = null;
    });
  };
});
