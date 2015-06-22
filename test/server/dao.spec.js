'use strict';

var config = require('config'),
	assert = require('assert');

var _ = require('lodash');

var Dao = require('../../server/dao');
var getResources = require('../../server/resource-provider');

describe('Dao', function () {
	var resources = null;
	var dao = null;

	before(function (done) {
		return getResources(config).then(function (resourceProvider) {
			resources = resourceProvider;
			dao = new Dao(resources);
			return dao.upsertPhoneNumber('1234', 'FOOSTER');
		}).nodeify(done);
	});

	it('provides phone_numbers data', function () {
		return dao.findPhoneNumber('1234').then(function (results) {
			assert.equal(results[0].display, 'FOOSTER')
		});
	});
});
