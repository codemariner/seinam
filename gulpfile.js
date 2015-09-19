/*eslint no-sync:0*/
'use strict';

var gulp         = require('gulp'),
	mocha        = require('gulp-mocha'),
	istanbul     = require('gulp-istanbul'),
	_            = require('lodash');

var fs   = require('fs'),
	path = require('path');

var IGNORE_ITEMS = ['node_modules', 'coverage', 'package.json'];

var topLevelPaths = (function getTopLevelPaths() {
	var items = fs.readdirSync(__dirname)
		.filter(function (entry) {
			return entry[0] !== '.' && IGNORE_ITEMS.indexOf(entry) < 0;
		})
		.filter(function (entry) {
			return fs.statSync(path.join(__dirname, entry)).isDirectory();
		})
		.join(',');
	if (items !== '') {
		return '{' + items + '}';
	}
	return '{_none_}'; // no subfolders to match
}());

var config = {
	ignore : IGNORE_ITEMS,
	coverage : {
		statements : 80,
		branches   : 80,
		functions  : 80,
		lines      : 80
	},
	paths : {
		js : [
			'*.js',
			topLevelPaths + '/**/*.js',
			'!lib/logger.js',
			'!*.spec.js',
			'!**/*.spec.js'
		],
		tests : [
			'test/**/*.spec.js'
		],
		whitespace : [
			'*.*',
			topLevelPaths + '/**/*.*',
			'!deploy/**/*',
			'!bin/**/*',
			'!schema/**/*.yaml',
			'!package.json',
			'!proto/package.json',
			'!**/*.bz2',
			'!**/*.gz'
		]
	}
};

function onError(e) {
	if (e.message) {
		console.error(e.message);
	}
	if (e.stack) {
		console.log(e.stack);
	}
	throw e;
}

gulp.task('mocha', function mochaTests(cb) {
	gulp.src(config.paths.js)
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on('finish', function runTests() {
			gulp.src(config.paths.tests)
				.pipe(mocha({timeout:2000}))
				.pipe(istanbul.writeReports())
				.on('error', onError);
		});
});

gulp.task('test', ['mocha']);
gulp.task('default', ['test']);
