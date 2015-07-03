'use strict';

var assert = require('assert');

var request = require('supertest'),
	_ = require('lodash'),
	Bluebird = require('bluebird');

var createApp = require('../../server/app');
var createResources = require('../../server/resource-provider');

describe('API', function () {

	describe('For unknown numbers', function () {
		var app = null;
		var resources = null;

		before(function () {
			var config = require('config'),
				config = _.cloneDeep(config);
				config.server.scripts = {
					path: './test/scripts_bad',
					timeout: 100
				};

			return createResources(config).then(function (_resources) {
				resources = _resources;
				return resources.dao._flushPhoneNumbers().then(function () {
					app = createApp(resources);
				});
			});
		});

		after(function () {
			return resources.close();
		});


		it('should return 404 response for an unknown phone number', function (done) {
			request(app)
				.get('/api/phone_numbers/1292341?token=foo')
				.expect(404, done);
		});
	});

	describe('For known numbers', function () {
		var app = null;
		var resources = null;

		before(function () {
			var config = require('config');

			return createResources(config).then(function (_resources) {
				resources = _resources;
				return resources.dao._flushPhoneNumbers().then(function () {
					app = createApp(resources);
				});
			});
		});

		after(function () {
			return resources.close();
		});


		it('should return 200 response with display output for a known phone number', function (done) {
			request(app)
				.get('/api/phone_numbers/1234234?token=foo')
				.expect(200, done);
		});
	});

});
