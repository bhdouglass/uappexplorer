'use strict';

angular.module('appstore', ['ui.router', 'angulartics', 'angulartics.google.analytics']);

angular.module('appstore').config(function($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider) {
  $urlRouterProvider.otherwise('/apps');
  $locationProvider.html5Mode(true);

  $stateProvider.state('main', {
    url: '/',
    templateUrl: '/app/partials/main.html',
    controller: 'mainCtrl'
  }).state('apps', {
    url: '/apps?q&category&sort&view&arch&framework&page',
    templateUrl: '/app/partials/apps.html',
    controller: 'appsCtrl',
    reloadOnSearch: false,
  }).state('app', {
    url: '/app/:name',
    templateUrl: '/app/partials/app.html',
    controller: 'appCtrl'
  });

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|scope):/);
});
