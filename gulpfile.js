const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const cleanCss = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const del = require('del');
const pump =require('pump');
const fs = require('fs');
const babel = require('gulp-babel');

gulp.task('clean', function() {
  del('dist', {dot:true})
});

gulp.task('html', function () {
  return gulp.src('src/*.html')
     .pipe(htmlmin({ collapseWhitespace: true }))
     .pipe(gulp.dest('dist'))
});


gulp.task('minify-css', function() {
  return gulp.src('src/css/*.css')
    .pipe(cleanCss())
    .pipe(gulp.dest('dist/css'))
});

gulp.task('img', function () {
  return gulp.src('src/img/*')
             .pipe(gulp.dest('dist/img'))
});


// From https://github.com/gulpjs/gulp/tree/master/docs/why-use-pump
// Makes it easier to handle error.
// pump allows errors to be propagates forward through the piped streams
// ans source streams are not closed if a destination stream is closed.
// pump handles errors from each stream and provides a gulp task with a callback
//   which signals successful task completion or failure
gulp.task('js', function (cb) {
  pump([
      gulp.src('src/js/*.js'),
      uglify(),
      gulp.dest('dist/js')
    ],
    cb
  );
});

gulp.task('sw', function(cb) {
  pump([
    gulp.src('src/sw.js'),
    uglify(),
    gulp.dest('dist')
  ],
    cb
  );
});

gulp.task('watch', function() {
  gulp.watch('src/**/*', ['default']);
});

gulp.task('default', ['clean', 'html', 'minify-css', 'img', 'js', 'sw', 'watch']);