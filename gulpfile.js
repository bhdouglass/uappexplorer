var fs = require('fs');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var push = require('git-push');
var rename = require('gulp-rename');
var shell = require('gulp-shell');
var template = require('gulp-template');
var del = require('del');
var i18nextparser = require('i18next-parser');
var merge = require('merge-stream');
var stylish = require('jshint-stylish');

var paths = {
  back_js: ['gulpfile.js', 'src/**/*.js'],
  back_extra: ['package.json', 'npm-shrinkwrap.json', 'src/**/*.json', '.openshift/**/*', 'Procfile'],
  front: 'www',
  front_dist: 'www/dist/**/*',
  po: 'po/**/*.po',
  dist: ['dist/**', '!dist/.git'],
  pot: 'www/app/**/*',
  pot_template: 'po/uappexplorer.pot.template',
};

gulp.task('clean', function() {
  del.sync(paths.dist);
});

gulp.task('lint', function() {
  return gulp.src(paths.back_js)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
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

gulp.task('i18next', function() {
  return gulp.src(paths.pot)
    .pipe(i18nextparser({
      locales: ['en_US'],
      functions: ['i18n.t'],
      output: 'dist/locales',
      namespaceSeparator: '|',
      keySeparator: '^',
    }))
    .pipe(gulp.dest('dist/locales'));
});

gulp.task('pot', ['i18next'], function() {
  var plurals = [
    'apps',
    'web apps',
    'games',
    'scopes',
  ];

  var pot = '';
  var translations = JSON.parse(
    fs.readFileSync('./dist/locales/en_US/translation.json')
  );

  for (var key in translations) {
    key = key.replace(/"/g, '\\"');
    if (plurals.indexOf(key) > -1) {
      pot += 'msgid "' + key + '"\nmsgid_plural "' + key + '"\nmsgstr[0] ""\nmsgstr[1] ""\n\n';
    }
    else {
      pot += 'msgid "' + key + '"\nmsgstr ""\n\n';
    }
  }

  //TODO also generate uappexplorer.en_US.po
  return gulp.src(paths.pot_template)
    .pipe(template({
      content: pot
    }))
    .pipe(rename('uappexplorer.pot'))
    .pipe(gulp.dest('po'));
});

gulp.task('build-front', shell.task(['cd ' + paths.front + ' && gulp build']));

gulp.task('copy-front', ['build-front'], function() {
  return gulp.src(paths.front_dist)
    .pipe(gulp.dest('dist/www'));
});

gulp.task('build', ['lint', 'clean', 'build-back', 'copy-front']);

gulp.task('deploy-app', ['build'], function(callback) {
  push('./dist', process.env.UAPPEXPLORER_APP_GIT, callback);
});

gulp.task('deploy-spider', ['build'], function(callback) {
  push('./dist', process.env.UAPPEXPLORER_SPIDER_GIT, callback);
});
