let pug = require('gulp-pug');
let gulp = require('gulp');

gulp.task('pug', function buildHTML() {
    gulp.src(['static/*.pug'], {
        base: 'static'
    })
        .pipe(pug())
        .pipe(gulp.dest('./static/'))
});
