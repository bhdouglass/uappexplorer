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
var push = require('git-push');
var del = require('del');
var merge = require('merge-stream');

var paths = {
  front_js: [],
  lint: [],
  back_js: ['gulpfile.js', 'src/**/*.js'],
  back_extra: ['package.json', 'npm-shrinkwrap.json', 'src/**/*.json', '.openshift/**/*'],
  imgs: 'www/img/*',
  less: 'www/less/*.less',
  html: [],
  po: 'po/**/*.po',
  dist: ['dist/**', '!dist/.git'],
};

gulp.task('clean', function() {
  del.sync(paths.dist);
});

gulp.task('lint', function() {
  return merge(
    gulp.src(paths.lint)
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

gulp.task('build-img', function() {
  return gulp.src(paths.imgs)
    .pipe(gulp.dest('dist/www/img'));
});

gulp.task('build-js', function() {
  return gulp.src(paths.front_js, {base: 'www/app'})
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/www/js'));
});

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

gulp.task('build', ['lint', 'clean', 'build-translations', 'build-js', 'build-img', 'build-less', 'build-html', 'build-back']);

gulp.task('deploy-app', ['build'], function(callback) {
  push('./dist', process.env.UAPPEXPLORER_APP_GIT, callback);
});

gulp.task('deploy-spider', ['build'], function(callback) {
  push('./dist', process.env.UAPPEXPLORER_SPIDER_GIT, callback);
});
