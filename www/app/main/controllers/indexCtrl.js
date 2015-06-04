'use strict';

angular.module('appstore').controller('indexCtrl', function ($scope, $rootScope, $state, $timeout, $location, $modal, ipCookie, utils, auth, og) {
  og.set('uApp Explorer', {});
  $scope.url = $location.protocol() + '://' + $location.host() + '/';
  $scope.$state = $state;

  $rootScope.loggedin = false;
  $rootScope.showSearch = false;
  $scope.showSearch = false;
  $scope.search = undefined;

  $rootScope.$watch('showSearch', function() {
    $scope.showSearch = $rootScope.showSearch;
  });

  $rootScope.toggleSearch = function() {
    $rootScope.showSearch = !$rootScope.showSearch;

    if ($rootScope.showSearch && $rootScope.seach === undefined) {
      $timeout(function() {
        $('.search-box input').focus();
      });
    }
  };

  $rootScope.setSearch = function(search) {
    $rootScope.search = search;
  };

  var searchTimeout = null;
  $rootScope.$watch('search', function() {
    $scope.search = $rootScope.search;
    if ($rootScope.search) {
      $rootScope.showSearch = true;
    }

    if ($state.current.name != 'apps') {
      if ($rootScope.search) {
        if (searchTimeout) {
          $timeout.cancel(searchTimeout);
          searchTimeout = null;
        }

        searchTimeout = $timeout(function() {
          $location.path('/apps');
          $location.search('q', $rootScope.search);
        }, 300);
      }
      else if ($rootScope.search !== undefined) {
        $location.path('/apps');
        $location.search('q', undefined);
      }
    }
  });

  $timeout(function() {
    $('.swipebox').swipebox();
  });

  $rootScope.dismissError = function() {
    $rootScope.error = '';
    if ($rootScope.errorCallback) {
      $rootScope.errorCallback();
      $rootScope.errorCallback = null;
    }
  };

  $rootScope.setError = function(error, errorCallback, errorClass) { //TODO refactor these var/fn names
    $rootScope.error = error;
    $rootScope.errorCallback = errorCallback;
    $rootScope.errorClass = errorClass;
  };

  $scope.collapse = function() {
    $timeout(function() {
      $('#main-menu').collapse('hide');
    });
  };

  $scope.faq = function() {
    $scope.collapse();

    $modal.open({
      templateUrl: '/app/main/partials/faq.html'
    });
  };

  $rootScope.donate = function() {
    $scope.collapse();

    $modal.open({
      templateUrl: '/app/main/partials/donate.html'
    });
  };

  $rootScope.login = function() {
    $scope.collapse();

    $modal.open({
      templateUrl: '/app/lists/partials/login.html'
    });
  };

  $rootScope.logout = function() {
    auth.logout();
  };

  $rootScope.backLink = function() {
    var href = '/';
    if ($state.current.name == 'app') {
      if ($rootScope.back) {
        href = $state.href('apps', $rootScope.back);
      }
      else {
        href = '/apps';
      }
    }
    else if ($state.current.name == 'list' && $rootScope.loggedin) {
      href = '/me';
    }

    return href;
  };

  $rootScope.showBack = function() {
    var show = false;
    if (['apps', 'app', 'list', 'me'].indexOf($state.current.name) > -1) {
      show = true;
    }

    return show;
  };

  auth.loggedin(function(user) {
    $rootScope.loggedin = !!user;
  });

  $timeout(function() {
    if (!ipCookie('disclaimer')) {
      $modal.open({
        templateUrl: '/app/main/partials/disclaimer.html'
      });

      var now = new Date();
      ipCookie('disclaimer', Math.floor(now.getTime() / 1000), {expires: 365});
    }

    auth.check();
  });
});
