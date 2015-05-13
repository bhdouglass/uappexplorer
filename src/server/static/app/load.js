LazyLoad.js([
  '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js',
  '//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/js/bootstrap.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/jquery.swipebox/1.3.0.2/js/jquery.swipebox.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.0/angular.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/angular-ui/0.4.0/angular-ui.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.11/angular-ui-router.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.1/ui-bootstrap-tpls.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/angulartics/0.17.2/angulartics.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/angulartics/0.17.2/angulartics-ga.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js',
  '//www.google-analytics.com/analytics.js',
  '/js/libs.js' + v,
  //@if ENV != 'production'
  '//cdnjs.cloudflare.com/ajax/libs/less.js/2.5.0/less.min.js',
  '/js/angular-cookie.min.js',
  '/js/qrcode-generator.js',
  '/js/angular-qrcode.js',
  //@endif
  '/app/app.js' + v,
  //@if ENV != 'production'
  '/app/controllers/indexCtrl.js',
  '/app/controllers/appsCtrl.js',
  '/app/controllers/appCtrl.js',
  '/app/controllers/mainCtrl.js',
  '/app/controllers/requestCtrl.js',
  '/app/services/api.js',
  '/app/services/utils.js',
  '/app/directives/stars.js',
  '/app/directives/pages.js',
  '/app/directives/ngContent.js',
  '/app/directives/type.js',
  '/app/directives/appView.js',
  '/app/filters/nl2br.js',
  '/app/filters/dollars.js',
  //@endif
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
  //'/css/main.css' + v,
]);
