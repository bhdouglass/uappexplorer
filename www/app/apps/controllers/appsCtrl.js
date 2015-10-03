'use strict';

angular.module('appstore').controller('appsCtrl', function ($scope, $rootScope, $timeout, $state, $stateParams, $location, $window, $q, gettextCatalog, api, utils) {
  $rootScope.app = null;
  $rootScope.back = {};
  $scope.apps = [];
  $scope.app_count = 0;
  $scope.current_page = 0;
  $scope.pages = 0;
  $scope.loading = false;
  $scope.can_load = false;
  $scope.categories = [];
  $scope.category = {
    name: gettextCatalog.getString('All Apps'),
    internal_name: 'all',
  };
  $scope.defaultSort = '-published_date';
  $scope.sort = $scope.defaultSort;
  $scope.defaultView = 'grid';
  $scope.view = $scope.defaultView;
  $scope.frameworks = [
    {
      label: gettextCatalog.getString('All'),
      value: 'All',
    }
  ];
  $scope.more_filters = false;
  $scope.defaultArchitecture = 'Any';
  $scope.architecture = $scope.defaultArchitecture;
  $scope.defaultFramework = 'All';
  $scope.framework = $scope.defaultFramework;
  $scope.type = 'all';
  $scope.licenses = [];
  $scope.license = null;
  $scope.appIcon = utils.appIcon;

  function getArchitectures() {
    return [
      {
        ///CPU architecture
        label: gettextCatalog.getString('Any'),
        value: 'Any',
      }, {
        ///CPU architecture
        label: gettextCatalog.getString('All'),
        value: 'All',
      }, {
        label: 'armhf',
        value: 'armhf',
      }, {
        label: 'i386',
        value: 'i386',
      }, {
        label: 'x86_64',
        value: 'x86_64',
      }
    ];
  }

  function getTypes() {
    return [
      {
        label: gettextCatalog.getString('All Types'),
        value: 'all'
      }, {
        label: gettextCatalog.getString('Apps'),
        value: 'application'
      }, {
        label: gettextCatalog.getString('Web Apps'),
        value: 'webapp'
      }, {
        label: gettextCatalog.getString('Scopes'),
        value: 'scope'
      }, {
        label: gettextCatalog.getString('Snappy Apps'),
        value: 'snappy'
      }
    ];
  }

  $scope.architectures = getArchitectures();
  $scope.sorts = utils.getSorts();
  $scope.typeList = getTypes();

  $scope.countTypes = {
    application: 'apps',
    scope: 'scopes',
    webapp: 'web apps',
    snappy: 'snappy apps',
    all: 'apps & scopes'
  };

  $scope.paging = {
    query: {},
    skip: 0,
    limit: 30,
    sort: '-published_date',
    mini: true,
  };

  $scope.$on('gettextLanguageChanged', function() {
    $scope.architectures = getArchitectures();
    $scope.sorts = utils.getSorts();
    $scope.typeList = getTypes();

    _.forEach($scope.categories, function(category) {
      if (category.internal_name == 'all') {
        category.name = gettextCatalog.getString('All Apps');
      }
    });

    if ($scope.category && $scope.category.internal_name == 'all') {
      $scope.category.name = gettextCatalog.getString('All Apps');
    }
    _.forEach($scope.frameworks, function(framework) {
      if (framework.value == 'All') {
        framework.label = gettextCatalog.getString('All');
      }
    });
  });

  var canceler = $q.defer();
  function fetchApps(oldValue, newValue) {
    if (!angular.equals(oldValue, newValue) || $scope.apps.length === 0) {
      canceler.resolve(); //abort previous request
      canceler = $q.defer();

      utils.loading($scope);
      api.apps($scope.paging, canceler, false, true).then(function(data) {
        $scope.apps = data.apps;
        $scope.app_count = data.count;
        $scope.pages = Math.ceil($scope.app_count / $scope.paging.limit);
      },
      function(err) {
        if (err.status > 0) { //0 means aborted
          console.error(err);
          $rootScope.setError(gettextCatalog.getString('Could not download app list, click to retry'), fetchApps);
        }
      })
      .finally(function() {
        utils.doneLoading($scope);
      });
    }
  }

  function fetchCategories() {
    api.categories().then(function(data) {
      $scope.categories = data;
      $scope.category = $scope.categories[0];

      locationChange();
    }, function(err) {
      console.error(err);
      $rootScope.errorCallback(gettextCatalog.getString('Could not download category list, click to retry'), fetchCategories);
    });
  }
  fetchCategories();

  function fetchFrameworks() {
    api.frameworks().then(function(data) {
      $scope.frameworks = data;
      $scope.framework = $scope.frameworks[0].value;

      locationChange();
    }, function(err) {
      console.error(err);
      $rootScope.errorCallback(gettextCatalog.getString('Could not download framework list, click to retry'), fetchFrameworks);
    });
  }
  fetchFrameworks();

  function fetchLicenses() {
    api.licenses().then(function(data) {
      $scope.licenses = data;

      locationChange();
    }, function(err) {
      console.error(err);
      $rootScope.errorCallback(gettextCatalog.getString('Could not download license list, click to retry'), fetchLicenses);
    });
  }
  fetchLicenses();

  $scope.$watch('current_page', function() {
    if ($scope.current_page !== undefined) {
      $window.scrollTo(0, 0);
      if ($scope.current_page === 0) {
        $location.search('page', undefined);
      }
      else {
        $location.search('page', $scope.current_page);
      }
    }

    $scope.paging.skip = $scope.current_page * $scope.paging.limit;
  });

  var searchTimeout = null;
  $rootScope.$watch('search', function(oldValue, newValue) {
    if (oldValue != newValue) {
      $location.search('page', undefined);
      $scope.current_page = 0;
      $scope.paging.skip = 0;
    }

    if ($rootScope.search) {
      if (searchTimeout) {
        $timeout.cancel(searchTimeout);
        searchTimeout = null;
      }

      searchTimeout = $timeout(function() {
        $location.search('q', $rootScope.search);
        if ($scope.sort == $scope.defaultSort) {
          $scope.sort = 'relevance';
          $location.search('sort', $scope.sort);
        }
      }, 300);
    }
    else {
      $location.search('q', undefined);
    }
  });

  $scope.changeCategory = function(category) {
    $scope.current_page = 0;
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
    $scope.current_page = 0;
    if (architecture == $scope.defaultArchitecture) {
      $location.search('arch', undefined);
    }
    else {
      $location.search('arch', architecture);
    }
  };

  $scope.changeFramework = function(framework) {
    $scope.current_page = 0;
    if (framework == $scope.defaultFramework) {
      $location.search('framework', undefined);
    }
    else {
      $location.search('framework', framework);
    }
  };

  $scope.changeLicense = function(license) {
    $scope.current_page = 0;
    if (license == $scope.defaultLicense) {
      $location.search('license', undefined);
    }
    else {
      $location.search('license', license);
    }
  };

  $scope.changeType = function(type) {
    $scope.current_page = 0;
    if (type == 'all') {
      $location.search('type', undefined);
    }
    else {
      $location.search('type', type);
    }
  };

  function locationChange() {
    if ($location.path() == '/apps') {
      $rootScope.back = $location.search();
    }
    else {
      return;
    }

    //start page
    var page = $location.search().page;
    if (page < 0) {
        $scope.current_page = 0;
    }
    else if (page !== undefined) {
      $scope.current_page = page;
    }
    //end page

    //start search
    $rootScope.search = $location.search().q;

    if ($rootScope.search) {
      $scope.paging.search = $rootScope.search;
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
      $scope.category = $scope.categories[0];
    }
    $scope.categoryModel = $scope.category;

    if (!$scope.category || $scope.category.internal_name == 'all' || !$scope.category.internal_name) {
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
    $scope.sortModel = $scope.sort;
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

    //start license
    $scope.license = $location.search().license;
    if ($scope.license == 'All' || !$scope.license) {
      $scope.paging.query.license = undefined;
    }
    else {
      _.forEach($scope.licenses, function(l) {
        if (l.value == $scope.license) {
          $scope.paging.query.license = l.label;
        }
      });
    }
    //end license

    //start type
    var type = $location.search().type;
    if (!type) {
      $scope.type = 'all';
    }
    else {
      $scope.type = type;
    }

    if ($scope.type == 'all' || !$scope.type) {
      $scope.paging.query.types = undefined;
    }
    else {
      var types = [$scope.type];
      $scope.paging.query.types = {'_$in': types};
    }
    $scope.typeModel = $scope.type;
    //end type

    //Check if we need to open the extra filters
    if ($scope.architecture != $scope.defaultArchitecture || $scope.framework != $scope.defaultFramework || $scope.license) {
      $scope.more_filters = true;
    }
  }
  locationChange();

  //Moved down hear to pick up changes from locationChange()
  $scope.$watch('paging', fetchApps, true);

  $scope.$on('$locationChangeSuccess', locationChange);
});
