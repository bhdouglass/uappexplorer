LazyLoad.js([
  '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js',
  '//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/js/bootstrap.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/jquery.swipebox/1.3.0.2/js/jquery.swipebox.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.0/angular.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/angular-ui/0.4.0/angular-ui.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.11/angular-ui-router.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/angulartics/0.17.2/angulartics.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/angulartics/0.17.2/angulartics-ga.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js',
  '//www.google-analytics.com/analytics.js',
  '/app/app.js' + v,
  '/app/controllers/indexCtrl.js' + v,
  '/app/controllers/appsCtrl.js' + v,
  '/app/controllers/appCtrl.js' + v,
  '/app/services/api.js' + v,
  '/app/services/utils.js' + v,
  '/app/directives/stars.js' + v,
  '/app/directives/pagination.js' + v,
  '/app/directives/ngContent.js' + v,
  '/app/filters/nl2br.js' + v,
  '/app/filters/dollars.js' + v,
], function() {
  ga('create', 'UA-16555025-3', 'auto');
});

LazyLoad.css([
  '//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css',
  '//cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.1.6/css/ripples.min.css',
  '//cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.1.6/css/material.min.css',
  '//cdnjs.cloudflare.com/ajax/libs/jquery.swipebox/1.3.0.2/css/swipebox.min.css',
  '//cdnjs.cloudflare.com/ajax/libs/angular-ui/0.4.0/angular-ui.min.css',
  '//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css',
  '//fonts.googleapis.com/css?family=Ubuntu',
  '/css/main.css',
]);
