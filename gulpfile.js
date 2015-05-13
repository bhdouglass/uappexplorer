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

var paths = {
  front_js: ['src/server/static/app/**/*.js', '!src/server/static/app/load.js'],
  js_libs: 'src/server/static/js/*.js',
  load: 'src/server/static/app/load.js',
  back_js: ['gulpfile.js', 'src/**/*.js', '!src/server/static/app/**/*.js', '!src/server/static/**/*.js'],
  imgs: 'src/server/static/img/*',
  less: 'src/server/static/less/*.less',
  html: ['src/server/static/*.html', 'src/server/static/app/**/*.html'],
  dist: 'src/server/static/dist/**'
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

  gulp.src(paths.front_js)
    .pipe(jshint(options))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));

  gulp.src(paths.less)
    .pipe(recess({
      noIDs: false,
      noOverqualifying: false
    }))
    .pipe(recess.reporter());
});

gulp.task('lint-back', function() {
  gulp.src(paths.back_js)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('build-html', function() {
  var today = new Date();

  gulp.src(paths.html, {base: 'src/server/static'})
    .pipe(preprocess({
        context: {ENV: 'production'}
    }))
    .pipe(template({
        version: today.getTime()
    }))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('src/server/static/dist'));
});

gulp.task('build-less', function() {
  gulp.src(paths.less)
    .pipe(less())
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
      cascade: false,
      remove: false
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('src/server/static/dist/css'));
});

gulp.task('build-img', function() {
  gulp.src(paths.imgs)
    .pipe(gulp.dest('src/server/static/dist/img'));
});

gulp.task('build-js', function() {
  gulp.src(paths.load)
    .pipe(preprocess({
      context: {ENV: 'production'}
    }))
    .pipe(uglify())
    .pipe(gulp.dest('src/server/static/dist/app'));

  gulp.src(paths.front_js, {base: 'src/server/static/app'})
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('src/server/static/dist/app'));

  gulp.src(paths.js_libs)
    .pipe(sourcemaps.init())
    .pipe(concat('libs.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('src/server/static/dist/js'));
});

gulp.task('lint', ['lint-front', 'lint-back']);
gulp.task('build', ['lint', 'clean', 'build-js', 'build-img', 'build-less', 'build-html']);
