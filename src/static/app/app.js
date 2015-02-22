'use strict';

var app = angular.module('app', ['ui.router', 'angulartics', 'angulartics.google.analytics']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider) {
  $urlRouterProvider.otherwise('/apps');
  $locationProvider.html5Mode(true)

  $stateProvider.state('apps', {
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
