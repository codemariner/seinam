'use strict';

var express = require('express');

module.exports = function(resources) {
	
	var app = express();

	// check for token
	app.use('/api', function (req, res, next) {
		if (!req.query.token) {
			res.status(400).send('Unauthorized access.');
			return;
		}
		resources.dao.findAccountByApiToken(req.query.token).then(function (account) {
			if (account && account.active) {
				req.account = account;
				return next();
			}

			res.status(400).send('Unauthorized access.');
		});
	});
	app.use('/api', require('./api/phone-numbers')(resources));

	return app;
}
