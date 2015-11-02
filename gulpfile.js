var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var minifyCSS = require('gulp-minify-css');
var template = require('gulp-template');
var preprocess = require('gulp-preprocess');
var htmlmin = require('gulp-htmlmin');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var recess = require('gulp-recess');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var react = require('gulp-react');
var push = require('git-push');
var del = require('del');
var merge = require('merge-stream');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var assign = require('lodash.assign');

var paths = {
  main_js: 'www/app/index.js',
  front_js: ['www/app/**/*.js'],
  lint: ['www/app/**/*.js'],
  back_js: ['gulpfile.js', 'src/**/*.js'],
  back_extra: ['package.json', 'npm-shrinkwrap.json', 'src/**/*.json', '.openshift/**/*'],
  imgs: 'www/img/*',
  less: 'www/less/*.less',
  css: [
    'www/bower/bootstrap/dist/css/bootstrap.min.css',
    'www/bower/bootstrap-material-design/dist/css/material.min.css',
    'www/bower/font-awesome/css/font-awesome.min.css',
  ],
  fonts: [
    'www/bower/font-awesome/fonts/*',
  ],
  html: ['www/*.html'],
  po: 'po/**/*.po',
  dist: ['dist/**', '!dist/.git'],
};

gulp.task('clean', function() {
  del.sync(paths.dist);
});

//TODO lint jsx
gulp.task('lint', function() {
  return merge(
    gulp.src(paths.lint)
      .pipe(react())
      .pipe(jshint(require('./.jshintrc-front.json')))
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter('fail')),

    gulp.src(paths.less)
      .pipe(recess({
        noIDs: false,
        noOverqualifying: false
      }))
      .pipe(recess.reporter()),

    gulp.src(paths.back_js)
      .pipe(jshint())
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter('fail'))
  );
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

gulp.task('build-css', function() {
  return gulp.src(paths.css)
    .pipe(concat('lib.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist/www/css'));
});

gulp.task('build-fonts', function() {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('dist/www/fonts'));
});

gulp.task('build-img', function() {
  return gulp.src(paths.imgs)
    .pipe(gulp.dest('dist/www/img'));
});

var customOpts = {
  entries: paths.main_js,
  debug: true,
};

var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));
b.transform(reactify);

function bundle() {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/www/js'));
}

gulp.task('build-js', bundle);
b.on('update', bundle);
b.on('log', gutil.log);

gulp.task('build-back', function() {
  return merge(
    gulp.src(paths.back_js)
      .pipe(gulp.dest('dist/src')),

    gulp.src(paths.back_extra, {base: '.'})
      .pipe(gulp.dest('dist')),

    gulp.src('.gitignore-deploy')
      .pipe(rename('.gitignore'))
      .pipe(gulp.dest('dist'))
  );
});

//TODO translations

gulp.task('watch', function() {
  gulp.watch(paths.front_js, ['lint', 'build-js']);
  gulp.watch(paths.html, ['build-html']);
  gulp.watch(paths.less, ['lint', 'build-less']);
});

gulp.task('build', ['lint', 'clean', 'build-js', 'build-img', 'build-less', 'build-css', 'build-fonts', 'build-html', 'build-back']);

gulp.task('build-watch', ['build'], function() {
  gulp.watch(paths.front_js, ['lint']);
  gulp.watch(paths.html, ['build-html']);
  gulp.watch(paths.less, ['lint', 'build-less']);
});

gulp.task('deploy-app', ['build'], function(callback) {
  push('./dist', process.env.UAPPEXPLORER_APP_GIT, callback);
});

gulp.task('deploy-spider', ['build'], function(callback) {
  push('./dist', process.env.UAPPEXPLORER_SPIDER_GIT, callback);
});
