'use strict';

var childProcess = require('child_process');

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


function ScriptHandler(opts) {
	this.scripts = [];
	this.scriptDir = sanitizeDirName(opts.path);
	this.timeout = opts.timeout;
}

ScriptHandler.prototype._loadScripts = function () {
	logger.info('Loading scripts from ' + this.scriptDir);

	var scriptDir = this.scriptDir,
		prev;

	// analyze files in the configured directory
	return fs.readdirAsync(this.scriptDir).bind(this).map(function (fileName) {
		// capture file stats
		return fs.statAsync(scriptDir + fileName).then(function (stat) {
			return Bluebird.resolve({fileName: fileName, stat: stat});
		});
	// collect all executable scripts
	}).reduce(function (scripts, entry) {
		if (isExecutable(entry.stat)) {
			scripts.push(entry.fileName);
		} else {
			logger.info('    Not executable. Skipping file. ' + entry.fileName);
		}
		return scripts;
	// store all executable scripts in linked list fashion
	}, []).then(function (scripts) {
		if (_.isEmpty(scripts)) {
			return Bluebird.reject('No executable scripts found under ' + scriptDir);
		}
		scripts.sort();
		var newScripts = [],
			prev = null;
		_.forEach(scripts, function (fileName, idx) {
			logger.info('    queuing script ' + (idx + 1) + ') ' + fileName);
			var entry = {file: scriptDir + fileName, next: null};
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

/**
 * Executes all script entries until the current script returns successful
 * output, or try the next entry, or return null.
 */
function execScriptEntries(entry, args) {
	var execFileAsync = Bluebird.promisify(childProcess.execFile);

	// TODO: set timeout options
	return execFileAsync(entry.file, args).then(function (stdout, stderr) {
		if (stderr) {
			logger.warn('Script %s returned with error output %s', entry.script, stderr);
		}
		return stdout.join('').trim();
	}).catch(function (err) {
		logger.warn('Error occurred while executing script %s', entry.file, err);
		if (entry.next) {
			return execScriptEntries(entry.next);
		}
	});
}

/**
 * Will return output from the first script that exits successfully.
 */
ScriptHandler.prototype.executeFirst = function (args) {
	return execScriptEntries(this.scripts[0], args);
}

module.exports = function(opts) {
	var handler = new ScriptHandler(opts);
	return handler._loadScripts().return(handler);
}
