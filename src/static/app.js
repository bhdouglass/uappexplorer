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

app.controller('indexCtrl', function ($scope, $http, $state, $timeout) {
  $scope.$state = $state;
  $scope.app_chunks = [];
  $scope.app = null;
  $scope.apps = [];
  $scope.app_count = 0;
  $scope.current_page = 0;
  $scope.pages = 1;
  $scope.pages_repeater = [];
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
      updatePaging();
    }, function(err) {
      //TODO error handling
    });
  }

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

  //TODO: split out paginator into a directive
  function updatePaging() {
    var pages_repeater = [];
    var start = $scope.current_page - 2;
    if (start < 0) {
      start = 0;
    }

    if (start + 3 > $scope.pages) {
      start - $scope.pages - 3;
    }

    for (var i = start; i < $scope.pages && i < start + 3; i++) {
      pages_repeater.push(i);
    }
    $scope.pages_repeater = pages_repeater;
  }

  $scope.$watch('current_page', updatePaging);

  $scope.$watch('paging', fetchApps, true);
  $scope.page = function(index) {
    $scope.current_page = index;
    $scope.paging.skip = index * $scope.paging.limit;
  };

  $scope.previous_page = function() {
    $scope.current_page--;

    if ($scope.current_page < 0) {
      $scope.current_page = 0;
    }

    $scope.page($scope.current_page);
  };

  $scope.next_page = function() {
    $scope.current_page++;

    if ($scope.current_page >= $scope.pages) {
      $scope.current_page = $scope.pages - 1;
    }

    $scope.page($scope.current_page);
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

app.directive('stars', function() {
  return {
    restrict: 'E',
    scope: {
      model: '=ngModel'
    },
    template: '<div class="text-primary" title="{{model}}/5">' +
                '<span ng-repeat="f in full track by $index"><i class="fa fa-star"></i></span>' +
                '<span ng-repeat="h in half track by $index"><i class="fa fa-star-half-o"></i></span>' +
                '<span ng-repeat="e in empty track by $index"><i class="fa fa-star-o"></i></span>' +
              '</div>',
    link: function($scope) {
      $scope.full = [];
      $scope.half = [];
      $scope.empty = [];

      $scope.$watch('model', function() {
        var model = $scope.model === undefined ? 0 : $scope.model;
        var full = Math.floor(model);
        var empty = 5 - Math.ceil(model);

        $scope.full = new Array(full);
        $scope.empty = new Array(empty);
        $scope.half = new Array(5 - full - empty);
      });
    }
  };
});

app.filter('category', function() {
  return function(category) {
    if (category.indexOf('-') > 0) {
      var index = category.indexOf('-') + 1;
      category = category.substr(0, index) + category.charAt(index).toUpperCase() + category.substr(index + 1);
      category = category.replace('-', ' / ');
    }

    return category;
  };
});
