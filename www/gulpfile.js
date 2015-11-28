var fs = require('fs');
var gulp = require('gulp');
var addsrc = require('gulp-add-src');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var htmlmin = require('gulp-htmlmin');
var i18nextconv = require('gulp-i18next-conv');
var jshint = require('gulp-jshint');
var jsonminify = require('gulp-jsonminify');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var push = require('git-push');
var react = require('gulp-react');
var recess = require('gulp-recess');
var rename = require('gulp-rename');
var template = require('gulp-template');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var del = require('del');
var merge = require('merge-stream');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var stylish = require('jshint-stylish');
var watchify = require('watchify');

var paths = {
  main_js: 'app/index.jsx',
  front_js: ['app/**/*.js', 'app/**/*.jsx'],
  lint: ['app/**/*.js', 'app/**/*.jsx'],
  imgs: [
    'img/*',
    'bower/swipebox/src/img/*'
  ],
  less: 'less/*.less',
  lib_js: [ //TODO see if there is a better way to include this
    'bower/jquery/dist/jquery.min.js',
    'bower/swipebox/src/js/jquery.swipebox.min.js',
  ],
  css: [
    'bower/bootstrap/dist/css/bootstrap.min.css',
    'bower/bootstrap-material-design/dist/css/material.min.css',
    'bower/font-awesome/css/font-awesome.min.css',
    'bower/slick-carousel/slick/slick.css',
    'bower/animate.css/animate.min.css',
    'bower/swipebox/src/css/swipebox.min.css',
  ],
  fonts: [
    'bower/font-awesome/fonts/*',
  ],
  html: ['*.html'],
  po: '../po/**/*.po',
  dist: ['dist/**', '!dist/.git'],
};

var bargs = {
  entries: paths.main_js,
  extensions: ['.jsx'],
  cache: {},
  packageCache: {},
};

gulp.task('clean', function() {
  del.sync(paths.dist);
});

gulp.task('lint', function() {
  return merge(
    gulp.src(paths.lint)
      .pipe(react())
      .pipe(jshint())
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter('fail')),

    gulp.src(paths.less)
      .pipe(recess({
        noIDs: false,
        noOverqualifying: false
      }))
      .pipe(recess.reporter())
  );
});

gulp.task('build-html', function() {
  var today = new Date();

  return gulp.src(paths.html, {base: 'www'})
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
    .pipe(gulp.dest('dist/css'));
});

gulp.task('build-css', function() {
  return gulp.src(paths.css)
    .pipe(concat('lib.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('build-fonts', function() {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('build-img', function() {
  return gulp.src(paths.imgs)
    .pipe(gulp.dest('dist/img'));
});

gulp.task('build-js', function() {
  var b = browserify(bargs);

  b.transform(reactify);
  b.on('log', gutil.log);

  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(addsrc(paths.lib_js))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('build-translations', function() {
  return gulp.src(paths.po)
    .pipe(i18nextconv(function() {
      return 'uappexplorer';
    }))
    .pipe(jsonminify())
    .pipe(gulp.dest('dist/translations'));
});

gulp.task('build', ['lint', 'clean', 'build-js', 'build-img', 'build-less', 'build-css', 'build-fonts', 'build-html', 'build-translations']);

gulp.task('build-watch', ['lint', 'clean', /*'build-js',*/ 'build-img', 'build-less', 'build-css', 'build-fonts', 'build-html', 'build-translations'], function() {
  gulp.watch(paths.front_js, ['lint']);
  gulp.watch(paths.html, ['build-html']);
  gulp.watch(paths.less, ['lint', 'build-less']);

  var b = watchify(browserify(bargs));

  b.transform(reactify);
  b.on('log', gutil.log);

  function bundle() {
    return b.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(addsrc(paths.lib_js))
      .pipe(concat('app.js'))
      .pipe(gulp.dest('dist/js'));
  }

  bundle();
  b.on('update', bundle);
});
