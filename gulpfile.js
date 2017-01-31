var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');

function html()
{
        gulp.src('src/*.html').pipe(gulp.dest('bin/client'));
}


function compile(watch) {
  var bundler = watchify(
                            browserify('./src/index.js', { debug: true }).transform(
                                    babel.configure({
                                            // Use all of the ES2015 spec
                                            presets: ["es2015"]
                                        })
                                  )
                  
                            
                        );

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./bin/client/js'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  return rebundle();
}

function watch() {
  return compile(true);
};

gulp.task('html', function() { html(); });
gulp.task('browserify', function() { return compile(false); });
gulp.task('watch', function() { return watch(); });

gulp.task('build', ['html', 'browserify']);

gulp.task('default', ['browserify']);

