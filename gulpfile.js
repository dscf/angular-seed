// Generated on 2016-08-04 using generator-angular 0.15.1
'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var jscs = require('gulp-jscs');
var openURL = require('open');
var lazypipe = require('lazypipe');
var rimraf = require('rimraf');
var wiredep = require('wiredep').stream;
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var ngTemplate = require('gulp-ng-template');
var concat = require('gulp-concat');
var flatten = require('gulp-flatten');
var gulpProtractorAngular = require('gulp-angular-protractor');
var jshint = require('gulp-jshint');
var gutil = require('gulp-util');
var stylish = require('gulp-jscs-stylish');
var map = require('map-stream');

var reportIfSuccessful = function(file, callback) {
  return map(function(file, callback) {
    if (file.jshint.success && file.jscs.success) {
      console.log(gutil.colors.white(file.path));
      /* Add green tick and success message in the same style as jshint-stylish */
      console.log('\n  ' + gutil.colors.green('\u2713  ') + gutil.colors.white('linting passed') + '\n');
    }
    callback(null, file)
  });
};


var conf = {
  app: require('./bower.json').appPath || 'app',
  dist: 'dist',
  test: 'test',
  moduleName: 'myApp'
};

var paths = {
  scripts: [conf.app + '/scripts/**/*.js'],
  styles: [conf.app + '/styles/**/*.scss'],
  test: ['test/ut/spec/**/*.js'],
  testRequire: [
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'bower_components/angular-resource/angular-resource.js',
    'bower_components/angular-cookies/angular-cookies.js',
    'bower_components/angular-sanitize/angular-sanitize.js',
    'bower_components/angular-route/angular-route.js',
    'bower_components/angular-animate/angular-animate.js',
    'bower_components/angular-touch/angular-touch.js',
    'bower_components/angular-ui-sortable/sortable.js',
    'bower_components/angular-local-storage/dist/angular-local-storage.js',
    'test/ut/mock/**/*.js',
    'test/ut/spec/**/*.js'
  ],
  karma: conf.test + '/ut/karma.conf.js',
  views: {
    main: conf.app + '/index.html',
    files: [conf.app + '/**/*.html']
  }
};

////////////////////////
// Reusable pipelines //
////////////////////////

var lintScriptsCore = lazypipe()
  .pipe(jshint)
  .pipe(jshint.reporter)
  .pipe(jscs)
  .pipe(jscs.reporter)
  .pipe(stylish.combineWithHintResults)
  .pipe(jshint.reporter, 'jshint-stylish')
  .pipe(reportIfSuccessful);


var lintScripts = function(src, fail) {
  var lint = gulp.src(src)
    .pipe(lintScriptsCore());

  if (fail) {
    return lint.pipe(jshint.reporter('fail'));
  } else {
    return lint;
  }
}


// var csScripts = lazypipe()
//   .pipe(jscs)
//   .pipe(jscs.reporter);


var styles = lazypipe()
  .pipe($.sass, {
    outputStyle: 'expanded',
    precision: 10
  })
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, '.tmp/styles');

///////////
// Tasks //
///////////

gulp.task('lint-e2e', function() {
  return lintScripts(conf.test + '/e2e/spec/**/*.js', true);
});

gulp.task('e2e', ['lint-e2e'], function(callback) {
  gulp
    .src([conf.test + '/e2e/spec/example-spec.js'])
    .pipe(gulpProtractorAngular({
      'configFile': conf.test + '/e2e/protractor.conf.js',
      'debug': false,
      'autoStartStopServer': true
    }))
    .on('error', function(e) {
      console.log(e);
    })
    .on('end', callback);
});

gulp.task('styles', function() {
  return gulp.src(paths.styles)
    .pipe(styles());
});


gulp.task('lint-test-fail', function() {
  return lintScripts(paths.test, true);
});

gulp.task('lint-test', function() {
  return lintScripts(paths.test, false);
});

gulp.task('lint', function() {
  return lintScripts(paths.scripts, true);
});

gulp.task('clean:tmp', function(cb) {
  rimraf('./.tmp', cb);
});

gulp.task('start:client', ['start:server', 'styles', 'html'], function() {
  openURL('http://localhost:9000');
});

gulp.task('start:server', function() {
  $.connect.server({
    root: [conf.app, '.tmp', 'bower_components'],
    livereload: true,
    // Change this to '0.0.0.0' to access the server from outside.
    port: 9000,
    middleware: function(connect, opt) {
      return [
        ['/bower_components',
          connect['static']('./bower_components')
        ]
      ]
    }
  });
});

gulp.task('start:server:test', function() {
  $.connect.server({
    root: ['test', conf.app, '.tmp'],
    livereload: true,
    port: 9001
  });
});

gulp.task('watch', function() {
  $.watch(paths.styles)
    .pipe($.plumber())
    .pipe(styles())
    .pipe($.connect.reload());

  $.watch(paths.views.files, function() {
    runSequence('html');
    gulp.src('.tmp/views/*html')
      .pipe($.plumber())
      .pipe($.connect.reload());
  });

  $.watch(paths.scripts)
    .pipe($.plumber())
    .pipe(lintScriptsCore())
    .pipe($.connect.reload());

  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('serve', function(cb) {
  runSequence('clean:tmp', ['lint'], ['start:client'],
    'watch', cb);
});

gulp.task('serve:prod', function() {
  $.connect.server({
    root: [conf.dist],
    livereload: true,
    port: 9000
  });
});

gulp.task('test', function() {
  runSequence('start:server:test', 'test-core', 'watch-test');
});

gulp.task('watch-test', function() {
  return gulp.watch(paths.test, ['test-core']);
});

gulp.task('test-core', function() {
  runSequence('lint-test', 'test-ut');
});

gulp.task('test-ut', function() {
  var testToFiles = paths.testRequire.concat(paths.scripts, paths.test);
  return gulp.src(testToFiles)
    .pipe($.karma({
      configFile: paths.karma,
      action: 'run'
    }));
});
// inject bower components
gulp.task('wiredep', function() {
  return gulp.src(paths.views.main)
    .pipe(wiredep({
      directory: 'bower_components',
      ignorePath: '..'
    }))
    .pipe(gulp.dest(conf.app));
});

///////////
// Build //
///////////

gulp.task('clean:dist', function(cb) {
  rimraf('./dist', cb);
});

gulp.task('cssmin', function() {
  var cssFilter = $.filter('**/*.css');
  return gulp.src(paths.views.main)
    .pipe($.useref({
      searchPath: [conf.app, '.tmp']
    }))
    .pipe(cssFilter)
    .pipe($.minifyCss({
      cache: true
    }))
    .pipe(cssFilter.restore())
    .pipe(gulp.dest('.tmp'));
});

//pull all scripts from index.html and build them to script.js and vendor.js
//also add angular annotation automatically.
gulp.task('extractAndAnnotate', function() {
  var jsFilter = $.filter('**/*.js');
  return gulp.src(paths.views.main)
    .pipe($.useref({
      searchPath: [conf.app, '.tmp']
    }))
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe(jsFilter.restore())
    .pipe(gulp.dest('.tmp/'));
});

//pull all html view files into javascript file
gulp.task('ngTemplate', function() {
  return gulp.src(conf.app + '/scripts/**/*.html')
    .pipe(flatten())
    .pipe(ngTemplate({
      moduleName: conf.moduleName,
      standalone: false,
      prefix: 'views/'
    }))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('jstask', function() {
  return runSequence('lint', 'lint-test-fail', 'test-ut', 'extractAndAnnotate', 'ngTemplate', 'appjsmin', 'vendorjsmin', 'reversion');
});

//reversion css files
gulp.task('revcss', function() {
  return gulp.src('.tmp/styles/*css')
    .pipe($.rev())
    .pipe(gulp.dest(conf.dist + '/styles/'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('.tmp/'));
});

//reversion js files
gulp.task('revjs', function() {
  return gulp.src('.tmp/scripts/*js')
    .pipe($.rev())
    .pipe(gulp.dest(conf.dist + '/scripts/'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('.tmp'));
});

//replace index.html based on new revision
gulp.task('revreplace', function() {
  var manifest = gulp.src('.tmp/rev-manifest.json');
  return gulp.src(conf.dist + '/index.html')
    .pipe($.revReplace({
      manifest: manifest
    }))
    .pipe(gulp.dest(conf.dist));
})

gulp.task('copyMainview', function() {
  return gulp.src('.tmp/index.html').pipe(gulp.dest(conf.dist));
});

gulp.task('reversion', ['copyMainview'], function() {
  runSequence('revcss', 'revreplace', 'revjs', 'revreplace');
});

//concat application script and template script and uglify
gulp.task('appjsmin', [], function() {
  return gulp.src(['.tmp/scripts/scripts.js', '.tmp/templates.js'])
    .pipe(concat('scripts.js'))
    // remove the comments below to get map file
    // .pipe(sourcemaps.init())
    .pipe($.uglify())
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('.tmp/scripts/'));
});

//minify vendor scripts
gulp.task('vendorjsmin', [], function() {
  return gulp.src(conf.dist + '/scripts/vendor.js')
  // remove the comments below to get map file
  // .pipe(sourcemaps.init())
    .pipe($.uglify())
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('.tmp/scripts/'));
});

gulp.task('client:build', [], function() {
  runSequence('styles', 'cssmin', 'jstask');
});

//copy html view files to  views folder
gulp.task('html', function() {
  return gulp.src(conf.app + '/**/*html')
    .pipe(flatten())
    .pipe(gulp.dest('.tmp/views'));
});

gulp.task('images', function() {
  return gulp.src(conf.app + '/images/**/*')
    .pipe(gulp.dest(conf.dist + '/images'));
});

gulp.task('copy:extras', function() {
  return gulp.src(conf.app + '/*/.*', {
    dot: true
  })
    .pipe(gulp.dest(conf.dist));
});

gulp.task('copy:fonts', function() {
  return gulp.src(conf.app + '/fonts/**/*')
    .pipe(gulp.dest(conf.dist + '/fonts'));
});

gulp.task('build', ['clean:dist'], function() {
  runSequence(['images', 'copy:extras', 'copy:fonts', 'client:build']);
});

gulp.task('default', ['build']);
