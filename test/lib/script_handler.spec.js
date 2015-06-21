'use strict';

var assert = require('assert'),
	config = require('config'),
	Bluebird = require('bluebird');

var _ = require('lodash');

var createScriptHandler = require('../../lib/script-handler');

describe('ScriptHandler', function () {
	var scriptHandler1 = null;
	var scriptHandler2 = null;
	var scriptHandler3 = null;

	before(function (done) {
		Bluebird.join(
			createScriptHandler({path: 'test/scripts/cnam'}),
			createScriptHandler({path: 'test/scripts/cnam2'}),
			createScriptHandler({path: 'test/scripts/cnam3'}),
			function (handler1, handler2, handler3) {
				scriptHandler1 = handler1;
				scriptHandler2 = handler2;
				scriptHandler3 = handler3;
			}
		).nodeify(done);
	});

	it('should load executable files', function () {
		assert.equal(3, scriptHandler1.scripts && scriptHandler1.scripts.length);
	});

	it('should link each executable file in sequence', function () {
		assert.equal(scriptHandler1.scripts[0].next, scriptHandler1.scripts[1]);
		assert.equal(scriptHandler1.scripts[1].next, scriptHandler1.scripts[2]);
		assert.equal(scriptHandler1.scripts[2].next, null);
	});

	it('should execute scripts and get the first output', function (done) {
		Bluebird.all([
			scriptHandler1.executeFirst('1234567890'),
			scriptHandler2.executeFirst('1234567890'),
			scriptHandler3.executeFirst('1234567890')
		]).spread(function (output1, output2, output3) {
			assert.equal('SCRIPT 1 OUTPUT', output1);
			assert.equal('SCRIPT 2 OUTPUT', output2);
			assert.equal('SCRIPT 3 OUTPUT', output3);
		}).nodeify(done);
	});
});
