'use strict';

var express = require('express'),
	Bluebird = require('bluebird'),
	_ = require('lodash');

var router = express.Router();

var getLogger = require('../../lib/logger'),
	logger = getLogger('api-phone-numbers');

function phoneNumberLookup(scripts, dao) {
	return function (req, res, next) {
		if (!req.params.number) {
			res.status(400).send({error: 'Missing number parameter.'});
		}

		dao.findPhoneNumber(req.params.number).then(function (result) {
			if (!_.isEmpty(result)) {
				res.send(result.display);
			} else {
				return scripts.executeFirst(req.params.number).then(function (output) {
					if (output) {
						dao.upsertPhoneNumber(req.params.number, output, true).error(function (err) {
							logger.error('Error occurred while upserting phone number data.', err);
						});
						res.send(output);
					} else {
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
