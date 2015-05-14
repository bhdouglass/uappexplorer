var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');
var minifyCSS = require('gulp-minify-css');
var template = require('gulp-template');
var preprocess = require('gulp-preprocess');
var htmlmin = require('gulp-htmlmin');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var recess = require('gulp-recess');
var del = require('del');
var merge = require('merge-stream');

var paths = {
  front_js: ['www/app/**/*.js', '!www/app/load.js', '!www/bower_components/**/*'],
  load: 'www/app/load.js',
  back_js: ['gulpfile.js', 'src/**/*.js', '!www/app/**/*.js', '!www/**/*.js'],
  imgs: 'www/img/*',
  less: 'www/less/*.less',
  html: ['www/*.html', 'www/app/**/*.html'],
  dist: 'www/dist/**',
  js_libs: [
    'www/bower_components/less/dist/less.min.js',
    'www/bower_components/jquery/dist/jquery.min.js',
    'www/bower_components/bootstrap/dist/js/bootstrap.min.js',
    'www/bower_components/swipebox/src/js/jquery.swipebox.min.js',
    'www/bower_components/angular/angular.min.js',
    'www/bower_components/angular-ui/build/angular-ui.min.js',
    'www/bower_components/angular-ui-router/release/angular-ui-router.min.js',
    'www/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
    'www/bower_components/angulartics/dist/angulartics.min.js',
    'www/bower_components/angulartics/dist/angulartics-ga.min.js',
    'www/bower_components/lodash/lodash.min.js',
    'www/bower_components/angular-cookie/angular-cookie.min.js',
    'www/bower_components/qrcode-generator/js/qrcode.js',
    'www/bower_components/angular-qrcode/qrcode.js',
  ],
  css_libs: [
    'www/bower_components/bootstrap/dist/css/bootstrap.min.css',
    'www/bower_components/bootstrap-material-design/dist/css/ripples.min.css',
    'www/bower_components/bootstrap-material-design/dist/css/material.min.css',
    'www/bower_components/swipebox/src/css/swipebox.min.css',
    'www/bower_components/angular-ui/build/angular-ui.min.css',
    'www/bower_components/font-awesome/css/font-awesome.min.css',
  ],
  img_libs: [
    'www/bower_components/swipebox/src/img/icons.png',
    'www/bower_components/swipebox/src/img/icons.svg',
    'www/bower_components/swipebox/src/img/loader.gif',
  ],
  fonts: [
    'www/bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2',
    'www/bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff',
    'www/bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf',
    'www/bower_components/font-awesome/fonts/fontawesome-webfont.woff2',
    'www/bower_components/font-awesome/fonts/fontawesome-webfont.woff',
    'www/bower_components/font-awesome/fonts/fontawesome-webfont.ttf',
    'www/bower_components/bootstrap-material-design/fonts/Material-Design-Icons.woff',
    'www/bower_components/bootstrap-material-design/fonts/Material-Design-Icons.ttf',
  ]
};

gulp.task('clean', function() {
  del.sync(paths.dist);
});

gulp.task('lint-front', function() {
  var options = {
    node: true,
    browser: true,
    esnext: true,
    curly: true,
    immed: true,
    indent: 2,
    latedef: true,
    newcap: true,
    noarg: true,
    quotmark: 'single',
    undef: true,
    unused: true,
    strict: false,
    globalstrict: true,
    trailing: true,
    smarttabs: true,
    devel: true,
    bitwise: false,
    globals: {
      angular: false,
      '_': false,
      '$': false,
      LazyLoad: false,
      v: false,
      ga: false
    }
  };

  var front_js = gulp.src(paths.front_js)
    .pipe(jshint(options))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));

  var less = gulp.src(paths.less)
    .pipe(recess({
      noIDs: false,
      noOverqualifying: false
    }))
    .pipe(recess.reporter());

  return merge(front_js, less);
});

gulp.task('lint-back', function() {
  return gulp.src(paths.back_js)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('build-html', function() {
  var today = new Date();

  return gulp.src(paths.html, {base: 'www'})
    .pipe(preprocess({
        context: {ENV: 'production'}
    }))
    .pipe(template({
        version: today.getTime()
    }))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('www/dist'));
});

gulp.task('build-less', function() {
  return gulp.src(paths.less)
    .pipe(less())
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
      cascade: false,
      remove: false
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('www/dist/css'));
});

gulp.task('build-img', function() {
  return gulp.src(paths.imgs)
    .pipe(gulp.dest('www/dist/img'));
});

gulp.task('build-libs', function() {
  var js_libs = gulp.src(paths.js_libs)
    .pipe(sourcemaps.init())
    .pipe(concat('libs.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('www/dist/js'));

  var css_libs = gulp.src(paths.css_libs)
    .pipe(concat('libs.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('www/dist/css'));

  var fonts = gulp.src(paths.fonts)
    .pipe(gulp.dest('www/dist/fonts'));

  var img_libs = gulp.src(paths.img_libs)
    .pipe(gulp.dest('www/dist/img'));

  return merge(js_libs, css_libs, fonts, img_libs);
});

gulp.task('build-js', function() {
  var load = gulp.src(paths.load)
    .pipe(preprocess({
      context: {ENV: 'production'}
    }))
    .pipe(uglify())
    .pipe(gulp.dest('www/dist/app'));

  var front_js = gulp.src(paths.front_js, {base: 'www/app'})
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('www/dist/app'));

  return merge(load, front_js);
});

gulp.task('lint', ['lint-front', 'lint-back']);
gulp.task('build', ['lint', 'clean', 'build-js', 'build-libs', 'build-img', 'build-less', 'build-html']);
