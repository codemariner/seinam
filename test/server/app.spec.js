'use strict';

var assert = require('assert');

var request = require('supertest'),
	_ = require('lodash'),
	Bluebird = require('bluebird'),
	moment = require('moment'),
	config = require('config');

var createApp = require('../../server/app');
var createResources = require('../../server/resource-provider');

describe('API', function () {

	var app = null;
	var resources = null;

	before(function () {
		return createResources(config).then(function (_resources) {
			resources = _resources;
			return resources.dao._flushAccounts();
		}).then(function () {
			return Bluebird.all([
				resources.dao.insertAccount('CUST1', 'cust1token', true),
				resources.dao.insertAccount('CUST2', 'cust2token', false)
			]);
		}).then(function () {
			return app = createApp(resources);
		});
	});

	after(function () {
		return resources.close();
	});

	describe('token validation', function () {
		it('should require a valid api token', function () {
			return new Bluebird(function (resolve, reject) {
				request(app)
					.get('/api/phone_numbers/1292341?token=foo')
					.expect(400, resolve);
			}).then(new Bluebird(function (resolve, reject) {
				request(app)
					.get('/api/phone_numbers/1292341?token=cust1token')
					.expect(200, resolve);
			}));
		});

		it('should require an active account', function (done) {
			request(app)
				.get('/api/phone_numbers/1292341?token=cust2token')
				.expect(400, done);
		});
	});

	describe('For unknown numbers', function () {
		var expiresAtMins = null,
			scriptHandler = null;

		before(function () {
			scriptHandler = resources.scriptHandler;
			scriptHandler.scriptDir = './test/scripts_bad/';
			expiresAtMins = config.phone_numbers.invalid_ttl_mins;

			return Bluebird.all([
				scriptHandler._loadScripts(),
				resources.dao._flushPhoneNumbers()]);
		});

		after(function () {
			scriptHandler.scriptDir = config.server.scripts.path + "/";
			return scriptHandler._loadScripts();
		});


		it('should return 404 response for an unknown phone number', function (done) {
			return request(app)
				.get('/api/phone_numbers/1292341?token=cust1token')
				.expect(404, done);
		});

		it('should cache invalidated numbers', function (done) {
			return request(app)
				.get('/api/phone_numbers/1292341?token=foo')
				.end(function (err, res) {
					resources.dao.findPhoneNumber('1292341').then(function (phoneNumber) {
						assert.equal(phoneNumber.validated, false);
						// should set the expiration time to the invalid ttl
						var expiresAt = moment(phoneNumber.created_at).add(expiresAtMins, 'minutes').toDate();
						assert.equal(phoneNumber.expires_at.getTime(), expiresAt.getTime());
					}).nodeify(done);
				});
		});
	});

	describe('For known numbers', function () {
		var expiresAtMins = config.phone_numbers.valid_ttl_mins;

		before(function () {
			return resources.dao._flushPhoneNumbers();
		});

		it('should return 200 response with display output for a known phone number', function (done) {
			return request(app)
				.get('/api/phone_numbers/+14341231234?token=cust1token')
				.expect(200, done);
		});

		it('should cache validated numbers', function (done) {
			return request(app)
				.get('/api/phone_numbers/+14341231234?token=cust1token')
				.end(function (err, res) {
					return Bluebird.delay(400).then(function () {
						return resources.dao.findPhoneNumber('4341231234').then(function (phoneNumber) {
							assert.ok(phoneNumber);
							assert.equal(phoneNumber.validated, true);
							// should set the expiration time to the invalid ttl
							var expiresAt = moment(phoneNumber.created_at).add(expiresAtMins, 'minutes').toDate();
							assert.equal(phoneNumber.expires_at.getTime(), expiresAt.getTime());
						});
					}).nodeify(done);
				});
		});
	});

	describe('For invalid numbers', function () {
		it('should return a 400 response with error message', function (done) {
			return request(app)
				.get('/api/phone_numbers/invalidphone-number?token=cust1token')
				.expect(400, done);
		});
	});

	xit('should provide a way to rescan the scripts directory', function () {
		// TODO: implement
	});

});
