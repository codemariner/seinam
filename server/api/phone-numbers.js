'use strict';

var express = require('express'),
	Bluebird = require('bluebird'),
	_ = require('lodash'),
	moment = require('moment');

var router = express.Router();

var getLogger = require('../../lib/logger'),
	parsePhoneNumber = require('../../lib/phone-number'),
	logger = getLogger('api-phone-numbers');

function _checkExpiration(dao, phoneNumber) {
	var expiresAt = phoneNumber.expires_at;
	if (expiresAt && moment(expiresAt).isBefore(new Date())) {
		dao.deletePhoneNumber(phoneNumber.number).catch(function (err) {
			logger.error('Error occurred while attempting to delete number.', phoneNumber);
		});
	}
}

function phoneNumberLookup(scripts, dao) {
	return function (req, res, next) {
		var phoneNumberText = req.params.number;
		if (phoneNumberText) {
			phoneNumberText = phoneNumberText.trim();
		}

		if (_.isEmpty(phoneNumberText)) {
			res.status(400).send({error: 'Missing phone number value.'});
			return next();
		}

		var numberResults,
			number;
		try {
			numberResults = parsePhoneNumber(phoneNumberText);
			number = numberResults.formattedNumber;
		} catch (e) {
			res.status(400).send({error: e.message});
			return next();
		}

		// if it's international, skip for now until we support
		// international caller id lookups
		if (numberResults.isInternational) {
			res.send('UNKNOWN');
			return next();
		}

		return dao.findPhoneNumber(number).then(function (result) {
			if (!_.isEmpty(result)) {
				res.send(result.display);
				_checkExpiration(dao, number);
			} else {
				return scripts.executeFirst(number).then(function (output) {
					if (output) {
						dao.upsertPhoneNumber(number, output, true).catch(function (err) {
							logger.error('Error occurred while upserting phone number data.', err);
						});
						res.send(output);
					} else {
						dao.upsertPhoneNumber(number, 'UNKNOWN', false).catch(function (err) {
							logger.error('Error occurred while upserting phone number data.', err);
						});
						res.status(404).send({error: 'No results.'});
					}
				});
			}
		}).finally(function () {
			return next();
		});
	}
}


module.exports = function(resourceProvider) {
	router.get('/phone_numbers/:number', phoneNumberLookup(resourceProvider.scriptHandler, resourceProvider.dao));
	return router;
}
