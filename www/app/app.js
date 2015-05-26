'use strict';

angular.module('appstore', [
  'ui.router', 'ui.bootstrap', 'angulartics', 'angulartics.google.analytics',
  'ipCookie', 'monospaced.qrcode', 'ngTouch', 'ngAnimate', 'base64'
]);

angular.module('appstore').config(function($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider) {
  $urlRouterProvider.otherwise('/apps');
  $locationProvider.html5Mode(true);

  $stateProvider.state('main', {
    url: '/',
    templateUrl: '/app/partials/main.html',
    controller: 'mainCtrl'
  })
  .state('apps', {
    url: '/apps?q&category&sort&view&arch&framework&page&type',
    templateUrl: '/app/partials/apps.html',
    controller: 'appsCtrl',
    reloadOnSearch: false,
  })
  .state('apps.request', {
    url: '/request',
    onEnter: ['$state', '$modal', function($state, $modal) {
        $modal.open({
            templateUrl: '/app/partials/request.html',
            controller: 'requestCtrl'
        }).result.finally(function() {
            $state.go('^');
        });
    }]
  })
  .state('app', {
    url: '/app/:name',
    templateUrl: '/app/partials/app.html',
    controller: 'appCtrl'
  })
  .state('me', {
    url: '/me',
    templateUrl: '/app/partials/me.html',
    controller: 'meCtrl'
  })
  .state('list', {
    url: '/list/:id',
    templateUrl: '/app/partials/list.html',
    controller: 'listCtrl'
  });

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|scope):/);
});

angular.module('appstore').run(function($rootScope, $modalStack, $timeout) {
  $rootScope.$on('$locationChangeStart', function(event) {
    var top = $modalStack.getTop();
    if (top) {
      $modalStack.dismiss(top.key);
      event.preventDefault();
    }

    $timeout(function() {
      if ($.swipebox.isOpen) {
        $.swipebox.close();
      }
    });
  });
});
