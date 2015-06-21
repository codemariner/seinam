'use strict';

var Bluebird = require('bluebird'),
	fs = Bluebird.promisifyAll(require('fs')),
	_ = require('lodash'),
	logger = require('./logger')('ScriptHandler');

function isExecutable(fileStat) {
	return !!(1 & parseInt((fileStat.mode & parseInt ("777", 8)).toString (8)[0]));
}

function sanitizeDirName(dirName) {
	dirName = _.trim(dirName);
	if (dirName.indexOf('/') !== dirName.length - 1) {
		dirName = dirName + '/'
	}
	return dirName
}

function ScriptHandler(scriptDir) {
	this.scripts = [];
	this.scriptDir = sanitizeDirName(scriptDir);
}

ScriptHandler.prototype._loadScripts = function () {
	var scriptDir = this.scriptDir,
		prev;
	logger.info('Loading cnam scripts from ' + this.scriptDir);

	return fs.readdirAsync(this.scriptDir).bind(this).map(function (fileName) {
		return fs.statAsync(scriptDir + fileName).then(function (stat) {
			return Promise.resolve({fileName: fileName, stat: stat});
		});
	}).reduce(function (scripts, entry) {
		if (isExecutable(entry.stat)) {
			scripts.push(entry.fileName);
		} else {
			logger.info('    Not executable. Skipping file. ' + entry.fileName);
		}
		return scripts;
	}, []).then(function (scripts) {
		if (_.isEmpty(scripts)) {
			return Bluebird.reject('No executable scripts found under ' + scriptDir);
		}
		scripts.sort();
		var newScripts = [],
			prev = null;
		_.forEach(scripts, function (fileName, idx) {
			logger.info('    queuing script ' + (idx + 1) + ') ' + fileName);
			var entry = {file: fileName, next: null};
			newScripts.push(entry);
			if (prev) {
				prev.next = entry;
			}
			prev = entry;
		});
		this.scripts = newScripts;
		return this.scripts;
	});
}


module.exports = function(scriptDir) {
	var handler = new ScriptHandler(scriptDir);
	return handler._loadScripts().return(handler);
}
