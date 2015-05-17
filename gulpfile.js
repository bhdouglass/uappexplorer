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
var templateCache = require('gulp-angular-templatecache');
var rename = require('gulp-rename');
var push = require('git-push');
var del = require('del');
var merge = require('merge-stream');

var paths = {
  front_js: ['www/app/**/*.js', '!www/app/load.js', '!www/bower_components/**/*'],
  load: 'www/app/load.js',
  back_js: ['gulpfile.js', 'src/**/*.js'],
  back_extra: ['package.json', 'src/**/*.json', '.openshift/**/*'],
  imgs: 'www/img/*',
  less: 'www/less/*.less',
  html: ['www/*.html'],
  partial_html: ['www/app/**/*.html'],
  dist: ['dist/**', '!dist/.git'],
  js_libs: [
    'www/bower_components/less/dist/less.min.js',
    'www/bower_components/jquery/dist/jquery.min.js',
    'www/bower_components/bootstrap/dist/js/bootstrap.min.js',
    'www/bower_components/swipebox/src/js/jquery.swipebox.min.js',
    'www/bower_components/angular/angular.min.js',
    'www/bower_components/angular-touch/angular-touch.min.js',
    'www/bower_components/angular-animate/angular-animate.min.js',
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
    'www/bower_components/font-awesome/fonts/fontawesome-webfont.woff2',
    'www/bower_components/font-awesome/fonts/fontawesome-webfont.woff',
    'www/bower_components/font-awesome/fonts/fontawesome-webfont.ttf',
  ],
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
    .pipe(gulp.dest('dist/www'));
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
    .pipe(gulp.dest('dist/www/css'));
});

gulp.task('build-img', function() {
  return gulp.src(paths.imgs)
    .pipe(gulp.dest('dist/www/img'));
});

gulp.task('build-libs', function() {
  var js_libs = gulp.src(paths.js_libs)
    .pipe(sourcemaps.init())
    .pipe(concat('libs.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist/www/js'));

  var css_libs = gulp.src(paths.css_libs)
    .pipe(concat('libs.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist/www/css'));

  var fonts = gulp.src(paths.fonts)
    .pipe(gulp.dest('dist/www/fonts'));

  var img_libs = gulp.src(paths.img_libs)
    .pipe(gulp.dest('dist/www/img'));

  return merge(js_libs, css_libs, fonts, img_libs);
});

gulp.task('build-js', function() {
  var partial_html = gulp.src(paths.partial_html)
    .pipe(templateCache('templates.js', {
      module: 'appstore',
      root: '/app'
    }));

  return merge(gulp.src(paths.front_js, {base: 'www/app'}), partial_html)
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/www/js'));
});

gulp.task('build-back', function() {
  var back_js = gulp.src(paths.back_js)
    .pipe(gulp.dest('dist/src'));

  var back_extra = gulp.src(paths.back_extra, {base: '.'})
    .pipe(gulp.dest('dist'));

  var back_gitignore = gulp.src('.gitignore-deploy')
    .pipe(rename('.gitignore'))
    .pipe(gulp.dest('dist'));

  return merge(back_js, back_extra, back_gitignore);
});

gulp.task('lint', ['lint-front', 'lint-back']);
gulp.task('build', ['lint', 'clean', 'build-js', 'build-libs', 'build-img', 'build-less', 'build-html', 'build-back']);
gulp.task('build-back-only', ['lint', 'clean', 'build-back', 'build-html']);

gulp.task('config-app', function() {
  gulp.src('config.json.app')
    .pipe(rename('config.json'))
    .pipe(gulp.dest('dist/src'));
});

gulp.task('deploy-app', ['build', 'config-app'], function(callback) {
  push('./dist', process.env.UAPPEXPLORER_APP_GIT, callback);
});

gulp.task('config-spider', function() {
  gulp.src('config.json.spider')
    .pipe(rename('config.json'))
    .pipe(gulp.dest('dist/src'));
});

gulp.task('deploy-spider', ['build-back-only', 'config-spider'], function(callback) {
  push('./dist', process.env.UAPPEXPLORER_SPIDER_GIT, callback);
});
