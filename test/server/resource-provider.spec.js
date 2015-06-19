'use strict';

var assert = require('assert');

var config = require('config');

describe('ResourceProvider', function () {

	var getResources = require('../../server/resource-provider');

	it ("should be able to connect to mysql", function (done) {
		return getResources(config).then(function (provider) {
			assert.ok(provider.mysql);
			return provider;
		}).call('close').nodeify(done);
	});

});
