LazyLoad.js([
  '//www.google-analytics.com/analytics.js',
  '/js/libs.js' + v,
  //@if ENV != 'production'
  '/bower_components/less/dist/less.min.js',
  '/bower_components/jquery/dist/jquery.min.js',
  '/bower_components/bootstrap/dist/js/bootstrap.min.js',
  '/bower_components/swipebox/src/js/jquery.swipebox.min.js',
  '/bower_components/angular/angular.min.js',
  '/bower_components/angular-touch/angular-touch.min.js',
  '/bower_components/angular-animate/angular-animate.min.js',
  '/bower_components/angular-ui/build/angular-ui.min.js',
  '/bower_components/angular-ui-router/release/angular-ui-router.min.js',
  '/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
  '/bower_components/angulartics/dist/angulartics.min.js',
  '/bower_components/angulartics/dist/angulartics-ga.min.js',
  '/bower_components/lodash/lodash.min.js',
  '/bower_components/angular-cookie/angular-cookie.min.js',
  '/bower_components/qrcode-generator/js/qrcode.js',
  '/bower_components/angular-qrcode/qrcode.js',
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
  //@if ENV != 'production'
  '/bower_components/bootstrap/dist/css/bootstrap.min.css',
  '/bower_components/bootstrap-material-design/dist/css/ripples.min.css',
  '/bower_components/bootstrap-material-design/dist/css/material.min.css',
  '/bower_components/swipebox/src/css/swipebox.min.css',
  '/bower_components/angular-ui/build/angular-ui.min.css',
  '/bower_components/font-awesome/css/font-awesome.min.css',
  //@endif
  '//fonts.googleapis.com/css?family=Ubuntu',
  '/css/main.css' + v,
  '/css/libs.css' + v,
]);
