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
			dao = new Dao(resources.mysql);
			return dao._flushPhoneNumbers();
		}).then(function () {
			return dao.insertPhoneNumber('1234', 'FOOSTER');
		}).nodeify(done);
	});

	after(function () {
		return resources.close();
	});

	it('provides phone_numbers data', function () {
		return dao.findPhoneNumber('1234').then(function (results) {
			assert.equal(results.display, 'FOOSTER')
			assert.equal(results.number, '1234')
		});
	});
	it('updates phone numbers', function () {
		return dao.updatePhoneNumber('1234', 'FOOSTER2').then(function (results) {
			return dao.findPhoneNumber('1234');
		}).then(function (results) {
			assert.equal(results.display, 'FOOSTER2')
		});
	});
	it('upsert phone numbers', function () {
		return dao.upsertPhoneNumber('1234', 'FOOSTER3').then(function (results) {
			return dao.findPhoneNumber('1234');
		}).then(function (results) {
			assert.equal(results.display, 'FOOSTER3')
		});
	});
});
