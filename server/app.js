'use strict';

var express = require('express');

module.exports = function(resources) {
	
	var app = express();

	// check for token
	app.use('/api', function (req, res, next) {
		if (!req.query.token) {
			var error = new Error('Unauthorized access.');
			res.status(400).send('Unauthorized access.');
			next(error);
		}
		resources.dao.findAccountByApiToken(req.query.token).then(function (account) {
			if (account && account.active) {
				req.account = account;
				return next();
			}

			var error = new Error('Unauthorized access.');
			res.status(400).send('Unauthorized access.');
			next(error);
		});
	});
	app.use('/api', require('./api/phone-numbers')(resources));

	return app;
}
