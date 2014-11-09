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
    limit: 25,
    sort: 'title'
  };

  $scope.$totals = [];
  function fetchApps() {
    $http.get('/api/apps').then(function(res) {
      if (res.data.success) {
        $scope.apps = _.sortBy(res.data.data, $scope.paging.sort);

        if ($scope.$state.current.name == 'app') {
          $scope.select($scope.$state.params.name);
        }
      }
      else {
        //TODO error handling
      }
    }, function(err) {
      //TODO error handling
    });
  }
  fetchApps();

  //TODO remove once server side paged
  $scope.$watch('paging.sort', function() {
    if ($scope.paging.sort.indexOf('-') == 0) {
      $scope.apps = _.sortBy($scope.apps, $scope.paging.sort.replace('-', '')).reverse();
    }
    else {
      $scope.apps = _.sortBy($scope.apps, $scope.paging.sort.replace('-', ''));
    }
  });

  $scope.app_chunks = [];
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

  $scope.app = null;
  $scope.select = function(name) { //TODO pull from api
    _.forEach($scope.apps, function(app) {
      if (app.name == name) {
        $scope.app = app;
        console.log($scope.app);

        return false;
      }
    });
  };
});
