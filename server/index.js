'use strict';

var fs = require('fs');

var express = require('express'),
	config = require('config'),
	Bluebird = require('bluebird');

var getLogger = require('../lib/logger'),
	getResources = require('./resource-provider'),
	pkg = require('../package'),
	api = require('./api');

var getApp = require('./app'),
	logger = getLogger(pkg.name),
	startTime = new Date().getTime();



logger.info('Starting server...');

getResources(config).then(function (resourceProvider) {
	var port = config.get('server.port'),
		app = getApp(resourceProvider);

	app.listen(port);

	return app;
}).then(function (app) {
	logger.info('API listening on port ' + config.get('server.port'));	
	logger.info('Startup completed in ' + (new Date().getTime() - startTime) + 'ms');
});

