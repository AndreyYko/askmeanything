var gulp         = require('gulp'),
		sass         = require('gulp-sass'),
		browserSync  = require('browser-sync'),
		concat       = require('gulp-concat'),
		uglify       = require('gulp-uglifyjs'),
		cssnano      = require('gulp-cssnano'),
		rename       = require('gulp-rename'),
		htmlmin      = require('gulp-htmlmin'),
		del          = require('del'),
		imagemin     = require('gulp-imagemin'),
		pngquant     = require('imagemin-pngquant'),
		cache        = require('gulp-cache'),
		autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function () {
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('normalize', function() {
	return gulp.src('node_modules/normalize.css/normalize.css')
	.pipe(gulp.dest('app/css'))
});

gulp.task('scripts', function() {
	return gulp.src([
			'app/libs/jquery/dist/jquery.min.js',
		])
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

gulp.task('css-libs', ['sass'], function() {
	return gulp.src('app/css/libs.css')
	.pipe(cssnano())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('app/css'));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
});

gulp.task('clean', function() {
	return del.sync('dist');
});

gulp.task('clear', function() {
	return cache.clearAll();
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img'));
});

gulp.task('watch', ['browser-sync', 'css-libs', 'normalize', 'scripts'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/*.html', browserSync.reload)
	gulp.watch('app/js/**/*.js', browserSync.reload)
});

gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function() {
	var buildCss = gulp.src(['app/css/style.css', 'app/css/normalize.css'])
	.pipe(cssnano())
	.pipe(gulp.dest('dist/css'));

	var cssLibs = gulp.src('app/css/libs.min.css')
	.pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src('app/js/*.js')
	.pipe(gulp.dest('dist/js'));

	var buildHtml = gulp.src('app/*.html')
	// .pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest('dist'));
});
