var app = angular.module('app', []);

app.controller('indexCtrl', function ($scope, $http) {
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

  $scope.packages = [];
  function fetchPackages() {
    $http.get('/api/apps').then(function(res) {
      if (res.data.success) {
        $scope.packages = _.sortBy(res.data.data, $scope.paging.sort);
      }
      else {
        //TODO
      }
    }, function(err) {
      //TODO
    });
  }
  fetchPackages();

  //TODO remove once server side paged
  $scope.$watch('paging.sort', function() {
    if ($scope.paging.sort.indexOf('-') == 0) {
      $scope.packages = _.sortBy($scope.packages, $scope.paging.sort.replace('-', '')).reverse();
    }
    else {
      $scope.packages = _.sortBy($scope.packages, $scope.paging.sort.replace('-', ''));
    }
  });

  $scope.package_chunks = [];
  $scope.$watch('packages', function() {
    var package_chunks = [];
    _.forEach($scope.packages, function(pkg, index) {
      if (index % 6 == 0) {
        package_chunks.push([]);
      }

      package_chunks[package_chunks.length - 1].push(pkg);
    });

    $scope.package_chunks = package_chunks;
  });
});
