'use strict';

var assert = require('assert');

var _ = require('lodash');

var createScriptHandler = require('../../lib/script_handler');

describe('ScriptHandler', function () {
	var scriptHandler = null;
	before(function (done) {
		return createScriptHandler('test/scripts/cnam').then(function (handler) {
			scriptHandler = handler;
		}).nodeify(done);
	});

	it ('should load executable files', function () {
		assert.equal(3, scriptHandler.scripts && scriptHandler.scripts.length);
	});

	it ('should link each executable file in sequence', function () {
		assert.equal(scriptHandler.scripts[0].next, scriptHandler.scripts[1]);
		assert.equal(scriptHandler.scripts[1].next, scriptHandler.scripts[2]);
		assert.equal(scriptHandler.scripts[2].next, null);
	});
});
