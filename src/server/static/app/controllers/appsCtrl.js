'use strict';

angular.module('appstore').controller('appsCtrl', function ($scope, $rootScope, $timeout, $state, $stateParams, $location, api, utils) {
  $rootScope.app = null;
  $rootScope.back = {};
  $scope.apps = [];
  $scope.app_count = 0;
  $scope.current_page = 0;
  $scope.pages = 0;
  $scope.loading = false;
  $scope.can_load = false;
  $scope.search = '';
  $scope.categories = [];
  $scope.category = {
    name: 'All Apps',
    internal_name: 'all',
  };
  $scope.defaultSort = '-published_date';
  $scope.sort = $scope.defaultSort;
  $scope.defaultView = 'grid';
  $scope.view = $scope.defaultView;
  $scope.frameworks = ['All'];
  $scope.more_filters = false;
  $scope.defaultArchitecture = 'Any';
  $scope.architecture = $scope.defaultArchitecture;
  $scope.defaultFramework = 'All';
  $scope.framework = $scope.defaultFramework;
  $scope.type = 'all';
  $scope.appIcon = utils.appIcon;
  $scope.types = utils.types;

  $scope.architectures = ['Any', 'All', 'armhf', 'i386', 'x86_64'];

  $scope.sorts = [
    {
      label: 'Title A-Z',
      value: 'title'
    }, {
      label: 'Title Z-A',
      value: '-title'
    }, {
      label: 'Newest ',
      value: '-published_date'
    }, {
      label: 'Oldest',
      value: 'published_date'
    }, {
      label: 'Highest Heart Rating',
      value: '-points'
    }, {
      label: 'Lowest Heart Rating',
      value: 'points'
    }, {
      label: 'Highest Star Rating',
      value: '-bayesian_average'
    }, {
      label: 'Lowest Star Rating',
      value: 'bayesian_average'
    }, {
      label: 'Free',
      value: 'prices.USD'
    }, {
      label: 'Most Expensive (USD)',
      value: '-prices.USD'
    },
  ];

  $scope.typeList = [
    {
      label: 'All Types',
      value: 'all'
    },
    {
      label: 'Apps',
      value: 'application'
    }, {
      label: 'Web Apps',
      value: 'webapp'
    }, {
      label: 'Scopes',
      value: 'scope'
    }
  ];

  $scope.countTypes = {
    application: 'apps',
    scope: 'scopes',
    webapp: 'web apps',
    all: 'apps & scopes'
  };

  $scope.paging = {
    query: {},
    skip: 0,
    limit: 30,
    sort: '-published_date',
    mini: true,
  };

  function fetchApps() {
    utils.loading($scope);
    api.apps($scope.paging).then(function(data) {
      $scope.apps = data.apps;
      $scope.app_count = data.count;
      $scope.pages = Math.ceil($scope.app_count / $scope.paging.limit);

    }, function(err) {
      console.error(err);
      $rootScope.setError('Could not download app list, click to retry', fetchApps);
    }).finally(function() {
      utils.doneLoading($scope);
    });
  }

  //TODO cache this in local storage
  function fetchCategories() {
    api.categories().then(function(data) {
      $scope.categories = data;
      $scope.category.name = $scope.categories[0].name;
      $scope.category.internal_name = $scope.categories[0].internal_name;

      locationChange();
    }, function(err) {
      console.error(err);
      $rootScope.errorCallback('Could not download category list, click to retry', fetchCategories);
    });
  }
  fetchCategories();

  //TODO cache this in local storage
  function fetchFrameworks() {
    api.frameworks().then(function(data) {
      $scope.frameworks = data;
      $scope.framework = $scope.frameworks[0];

      locationChange();
    }, function(err) {
      console.error(err);
      $rootScope.errorCallback('Could not download framework list, click to retry', fetchFrameworks);
    });
  }
  fetchFrameworks();

  $scope.$watch('paging', fetchApps, true);

  $scope.$watch('current_page', function() {
    if ($scope.current_page) {
      $location.search('page', $scope.current_page);
    }

    $scope.paging.skip = $scope.current_page * $scope.paging.limit;
  });

  var searchTimeout = null;
  $scope.$watch('search', function(oldValue, newValue) {
    if (oldValue != newValue) {
      $location.search('page', undefined);
      $scope.current_page = 0;
      $scope.paging.skip = 0;
    }

    if ($scope.search) {
      if (searchTimeout) {
        $timeout.cancel(searchTimeout);
        searchTimeout = null;
      }

      searchTimeout = $timeout(function() {
        $location.search('q', $scope.search);
      }, 300);
    }
    else {
      $location.search('q', undefined);
    }
  });

  $scope.changeCategory = function(category) {
    if (category.internal_name == 'all') {
      $location.search('category', undefined);
    }
    else {
      $location.search('category', category.internal_name);
    }
  };

  $scope.changeSort = function(sort) {
    if (sort == $scope.defaultSort) {
      $location.search('sort', undefined);
    }
    else {
      $location.search('sort', sort);
    }
  };

  $scope.changeView = function(view) {
    if (view == $scope.defaultView) {
      $location.search('view', undefined);
    }
    else {
      $location.search('view', view);
    }
  };

  $scope.changeArchitecture = function(architecture) {
    if (architecture == $scope.defaultArchitecture) {
      $location.search('arch', undefined);
    }
    else {
      $location.search('arch', architecture);
    }
  };

  $scope.changeFramework = function(framework) {
    if (framework == $scope.defaultFramework) {
      $location.search('framework', undefined);
    }
    else {
      $location.search('framework', framework);
    }
  };

  $scope.changeType = function(type) {
    if (type == 'all') {
      $location.search('type', undefined);
    }
    else {
      $location.search('type', type);
    }
  };

  function locationChange() {
    //start page
    var page = $location.search().page;
    if (page) {
      $scope.current_page = page;
    }
    //end page

    //start search
    $scope.search = $location.search().q;

    if ($scope.search) {
      $scope.paging.search = $scope.search;
    }
    else {
      $scope.paging.search = undefined;
    }
    //end search

    //start category
    var internal_name = $location.search().category;
    if (internal_name) {
      _.forEach($scope.categories, function(category) {
        if (category.internal_name == internal_name) {
          $scope.category = category;
          return false;
        }
      });
    }
    else {
      $scope.category = {
        name: 'All Apps',
        internal_name: 'all',
      };
    }

    if ($scope.category.internal_name == 'all' || !$scope.category.internal_name) {
      $scope.paging.query.categories = undefined;
    }
    else {
      $scope.paging.query.categories = $scope.category.internal_name;
    }
    //end category

    //start sort
    var sort = $location.search().sort;
    if (!sort) {
      $scope.sort = $scope.defaultSort;
    }
    else {
      $scope.sort = sort;
    }

    $scope.paging.sort = $scope.sort;
    //end sort

    //start view
    var view = $location.search().view;
    if (!view) {
      $scope.view = $scope.defaultView;
    }
    else {
      $scope.view = view;
    }
    //end view

    //start arch
    var architecture = $location.search().arch;
    if (!architecture) {
      $scope.architecture = $scope.defaultArchitecture;
    }
    else {
      $scope.architecture = architecture;
    }

    if (!$scope.architecture || $scope.architecture.toLowerCase() == 'any') {
      $scope.paging.query.architecture = undefined;
    }
    else {
      var architectures = [$scope.architecture.toLowerCase()];
      if ($scope.architecture.toLowerCase() != 'all') {
        architectures.push('all');
      }

      $scope.paging.query.architecture = {'_$in': architectures};
    }
    //end arch

    //start framework
    var framework = $location.search().framework;
    if (!framework) {
      $scope.framework = $scope.defaultFramework;
    }
    else {
      $scope.framework = framework;
    }

    if ($scope.framework == 'All' || !$scope.framework) {
      $scope.paging.query.framework = undefined;
    }
    else {
      var frameworks = [$scope.framework];
      $scope.paging.query.framework = {'_$in': frameworks};
    }
    //end framework

    //start type
    var type = $location.search().type;
    if (!type) {
      $scope.type = 'all';
    }
    else {
      $scope.type = type;
    }

    if ($scope.type == 'all' || !$scope.type) {
      $scope.paging.query.type = undefined;
    }
    else {
      $scope.paging.query.type = $scope.type;
    }
    //end type
  }
  locationChange();

  $scope.$on('$locationChangeSuccess', locationChange);

  $scope.$on('$stateChangeStart', function() {
    $rootScope.back = $location.search();
  });
});
