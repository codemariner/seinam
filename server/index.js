'use strict';

var fs = require('fs');

var express = require('express'),
	config = require('config'),
	Bluebird = require('bluebird');

var getLogger = require('../lib/logger'),
	getResources = require('./resource-provider'),
	pkg = require('../package'),
	api = require('./api');

var app = null,
	resources = null,
	logger = getLogger(pkg.name),
	startTime = new Date().getTime();


function loadApi() {
	var port = config.get('server.port');
	var app = express();

	app.use(function (req, res, next) {
		if (!req.params.token) {
			res.status(400).send('Unauthorized access.');
			return next(new Error('Unauthorized access.'));
		}
		next();
	});
	app.use('/api', require('./api/phone-numbers')(resources));

	app.listen(port);
	return app;
}


logger.info('Starting server...');

getResources(config).tap(function (resourceProvider) {
	resources = resourceProvider;
}).then(loadApi).then(function (app) {
	logger.info('API listening on port ' + config.get('server.port'));	
	logger.info('Startup completed in ' + (new Date().getTime() - startTime) + 'ms');
});

