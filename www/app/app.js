'use strict';

angular.module('appstore', [
  'ui.router', 'ui.bootstrap', 'angulartics', 'angulartics.google.analytics',
  'ipCookie', 'monospaced.qrcode', 'ngTouch', 'ngAnimate', 'base64', 'gettext'
]);

angular.module('appstore').config(function($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider) {
  $urlRouterProvider.otherwise('/apps');
  $locationProvider.html5Mode(true);

  $stateProvider.state('main', {
    url: '/',
    templateUrl: '/app/main/partials/main.html',
    controller: 'mainCtrl'
  })
  .state('apps', {
    url: '/apps?q&category&sort&view&arch&framework&page&type',
    templateUrl: '/app/apps/partials/apps.html',
    controller: 'appsCtrl',
    reloadOnSearch: false,
  })
  .state('apps.request', {
    url: '/request',
    onEnter: ['$state', '$modal', function($state, $modal) {
      $modal.open({
        templateUrl: '/app/apps/partials/request.html',
        controller: 'requestCtrl'
      }).result.finally(function() {
        $state.go('^');
      });
    }]
  })
  .state('app', {
    url: '/app/:name',
    templateUrl: '/app/apps/partials/app.html',
    controller: 'appCtrl'
  })
  .state('me', {
    url: '/me',
    templateUrl: '/app/lists/partials/me.html',
    controller: 'meCtrl'
  })
  .state('me.listedit', {
    url: '/list/:id',
    onEnter: ['$state', '$modal', '$timeout', function($state, $modal, $timeout) {
      $timeout(function() {
        $modal.open({
          templateUrl: '/app/lists/partials/listEdit.html',
          controller: 'listEditCtrl'
        }).result.finally(function() {
          $state.go('^');
        });
      });
    }]
  })
  .state('list', {
    url: '/list/:id',
    templateUrl: '/app/lists/partials/list.html',
    controller: 'listCtrl'
  });

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|scope):/);
});

angular.module('appstore').run(function($rootScope, $modalStack, $timeout, $location) {
  $rootScope.$on('$locationChangeStart', function(event) {
    var top = $modalStack.getTop();
    if (top) {
      $modalStack.dismiss(top.key);
      event.preventDefault();
    }

    $timeout(function() {
      $rootScope.dismissError();

      if ($location.path() == '/apps') {
        $rootScope.showSearch = true;
      }
      else {
        $rootScope.showSearch = false;
        $rootScope.search = undefined;
      }

      $('#main-menu').collapse('hide');

      if ($.swipebox.isOpen) {
        $.swipebox.close();
      }
    });
  });
});
