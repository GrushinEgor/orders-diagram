var gulp = require('gulp');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');  
var csso = require('gulp-csso');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify'); 
var conct = require('gulp-concat'); 
var ngAnnotate = require('gulp-ng-annotate');
var mainBowerFiles = require('main-bower-files');



gulp.task('ext-js', function() { 
	var src = mainBowerFiles({
		paths: {
			bowerDirectory: '../external-libraries',
			bowerrc: '../.bowerrc',
			bowerJson: '../bower.json'
		}
	});
	src.push('!../external-libraries/angular/**/*.js');
	src.push('../external-libraries/ui.bootstrap/ui-bootstrap-tpls-1.0.3.min.js');

	gulp.src(src)
	.pipe(conct('external-libraries.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('../app/static/js/'));

	gulp.src(['../external-libraries/angular/angular.js'])
	.pipe(gulp.dest('../app/static/js/'));
}); 





gulp.task('angular-js', function() { 
	gulp.src([
		'../project-libraries/**/*.js', 
		'../project-libraries/app.js'
		])
	.pipe(conct('app.js'))
	// .pipe(ngAnnotate({
	// 	remove: true,
	// 	add: true,
	// 	single_quotes: true
	// }))
	// .pipe(uglify())
	.pipe(gulp.dest('../app/static/js/'));

}); 


gulp.task('sass-compile', function() {
	gulp.src('../scss/app.scss')
	.pipe(sass().on('error', sass.logError))
	// .pipe(csso())
	// .pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('../app/static/css/'));
});
//Watch task

gulp.task('default', ['sass-compile', 'ext-js', 'angular-js'], function(){
	livereload.listen();


	gulp.watch('../scss/**/*.scss',['sass-compile']);
	gulp.watch('../project-libraries/**/*.js',['angular-js']);
	gulp.watch('../external-libraries/**/*.js',['ext-js']);


	gulp.watch(['../app/*.html']).on('change', livereload.changed);
	gulp.watch(['../app/static/js/*.js']).on('change', livereload.changed);
	gulp.watch(['../app/static/css/*.css']).on('change', livereload.changed);
});