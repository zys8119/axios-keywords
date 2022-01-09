const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const uglify = require('gulp-uglify')
const babel = require("gulp-babel");
const umd = require("gulp-umd");
gulp.task("default", function () {
    return gulp.src("src/**")
        .pipe(tsProject())
        .js
        .pipe(babel({
            presets: ["@babel/preset-env"]
        }))
        // .pipe(umd())
        // .pipe(uglify())
        .pipe(gulp.dest("dist"));
});