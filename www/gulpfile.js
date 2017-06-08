var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
//var i18nextconv = require('gulp-i18next-conv');
var jshint = require('gulp-jshint');
//var jsonminify = require('gulp-jsonminify');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var recess = require('gulp-recess');
var template = require('gulp-template');
var del = require('del');
var merge = require('merge-stream');
var stylish = require('jshint-stylish');
var webpack = require('webpack-stream');
var webpackConfig = require('./webpack.config');

var paths = {
  main_js: 'app/index.jsx',
  front_js: ['app/**/*.js', 'app/**/*.jsx'],
  lint: ['app/**/*.js', 'gulpfile.js'],
  imgs: [
    'img/*',
    'bower_components/swipebox/src/img/*'
  ],
  less: 'less/*.less',
  css: [
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/bootstrap-material-design/dist/css/material.min.css',
    'bower_components/font-awesome/css/font-awesome.min.css',
    'bower_components/slick-carousel/slick/slick.css',
    'bower_components/animate.css/animate.min.css',
    'bower_components/swipebox/src/css/swipebox.min.css',
  ],
  fonts: [
    'bower_components/font-awesome/fonts/*',
  ],
  html: ['*.html'],
  po: '../po/**/*.po',
  dist: ['dist/**', '!dist/.git'],
};

gulp.task('clean', function() {
  del.sync(paths.dist);
});

gulp.task('lint', function() {
  return merge(
    //TODO lint jsx in webpack
    gulp.src(paths.lint)
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
  return gulp.src(paths.main_js)
    .pipe(webpack(webpackConfig, null, function(err) {
      if (err) {
        throw err;
      }
    }))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('watch-js', function() {
  webpackConfig.watch = true;

  return gulp.src(paths.main_js)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('build-translations', function() {
  /*return gulp.src(paths.po)
    .pipe(i18nextconv(function() {
      return 'uappexplorer';
    }))
    .pipe(jsonminify())
    .pipe(gulp.dest('dist/translations'));*/
});

gulp.task('build', ['lint', 'clean', 'build-js', 'build-img', 'build-less', 'build-css', 'build-fonts', 'build-html', 'build-translations']);

gulp.task('watch', ['lint', 'clean', 'watch-js', 'build-img', 'build-less', 'build-css', 'build-fonts', 'build-html', 'build-translations'], function() {
  gulp.watch(paths.front_js, ['lint']);
  gulp.watch(paths.html, ['build-html']);
  gulp.watch(paths.less, ['lint', 'build-less']);

  //webpack-stream handles the watching
  //gulp.watch(paths.front_js, ['lint', 'build-js']);
});
