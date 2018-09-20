var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var browserify = require("browserify");
var watchify = require("watchify");
var babel = require("babelify");
var del = require("del");




var gutil = require("gulp-util");
var exhaustively = require("stream-exhaust");
var gubabel = require("gulp-babel");

const eslint = require("gulp-eslint");

function lint() {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(["src/**/*.js","!node_modules/**"])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
}


function html()
{
    gulp.src("src/client/**/*.html").pipe(gulp.dest("bin/client"));
}


function compile(watch) {

    var opts = watchify.args;
    opts.entries = ["./src/client/js/index.js"];
    opts.debug = true;

    function dob(){
        return  browserify(opts).transform(
                                    babel.configure({
                                            // Use all of the ES2015 spec
                                        presets: ["es2015"]
                                    })
                                  );
    }

    function dow(){return watchify(dob());}

    var bundler = (watch)?dow():dob();                 
                       

    bundler.on("log", gutil.log);

    function rebundle() {
        var b = bundler.bundle()
      .on("error", function(err) { console.error(err); this.emit("end"); })
      .pipe(source("app.js"))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest("./bin/client/js"));

        return b;
    }

    if (watch) {
        bundler.on("update", function() {
            console.log("-> bundling...");
            rebundle();
        });
    }

    return rebundle();
}

function watch() {
    return compile(true);
}

function server(){
    
    return gulp.src(["src/**/*.js", "!src/**/client/*"])
            .pipe(sourcemaps.init())
            .pipe(gubabel( {presets: ["es2015"]} ))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest("bin"));

}

gulp.task("clean", function () {
    return del([
        "statman/**/*"
    ]);
});

gulp.task("html", function() { html(); });

gulp.task("browserify", function() { return exhaustively( compile(false) ); });

gulp.task("server", function() { server(); });

gulp.task("watch", function() { return watch(); });

gulp.task("lint", function() { lint(); });

gulp.task("build", ["lint", "html", "browserify", "server"]);

gulp.task("default", ["browserify"]);

