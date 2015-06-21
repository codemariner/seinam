'use strict';

var fs = require('fs');

var express = require('express'),
	config = require('config'),
	Bluebird = require('bluebird');

var getLogger = require('../lib/logger'),
	getResources = require('./resource-provider'),
	pkg = require('../package');

var app = null,
	resources = null,
	logger = getLogger(pkg.name),
	startTime = new Date().getTime();

function loadApi() {
	Bluebird.promisify(fs.readdir)(config.get('server.cnam_scripts')).then(function (list) {
	});
}

function startApi() {
	var port = config.get('server.port');
	var app = express();

	// error handlers
// 	app.configure('development', function () {
// 		app.use(express.errorHandler({
// 			showStack: true,
// 			dumpExceptions: true
// 		}));
// 	});
// 	app.configure('production', function () {
// 		app.use(express.errorHandler());
// 	});

	loadApi(app);

	app.listen(port);
	return app;
}


logger.info('Starting server...');
getResources(config).tap(function (resourceProvider) {
	resources = resourceProvider;
}).then(startApi).then(function (app) {
	logger.info('API listening on port ' + config.get('server.port'));	
	logger.info('Startup completed in ' + (new Date().getTime() - startTime) + 'ms');
});

