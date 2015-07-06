'use strict';

var Bluebird = require('bluebird'),
	Mysql = require('mysql'),
	_ = require('lodash');

var getLogger = require('../lib/logger'),
	createScriptHandler = require('../lib/script-handler'),
	Dao = require('./dao');

var logger = getLogger('ResourceProvider');


// default configuration
var defaults = {
	db: {
		username: "root",
		password: "",
		database: "seinam",
		host: "localhost",
		port: 3306
	},
	scripts: {
		path: 'scripts/cnam',
		timeoutMs: 1000
	}
}

function ResourceProvider(config) {
	this.config = {
		db: _.defaults({}, config.db, defaults.db),
		scripts: _.defaults({}, config.scripts, config.server.scripts)
	};
	this.mysql = null;
	this.scriptHandler = null;
	this.dao = null;
}

ResourceProvider.prototype.load = function load() {
	if (this.mysql) {
		return Bluebird.reject(new Error('Already connected'));
	}

	var connection = Bluebird.promisifyAll(Mysql.createConnection(this.config.db));
	var mysqlPromise = connection.connectAsync().bind(this).then(function () {
		logger.info('Connected to mysql server %s', this.config.db.host + ':' + this.config.db.port);
		this.mysql = connection;
	}).bind(this).tap(function () {
		this.dao = new Dao(this.mysql);
	});

	var getHandler = createScriptHandler(this.config.scripts).bind(this).then(function (handler) {
		this.scriptHandler = handler;
	});

	return Bluebird.join(mysqlPromise, getHandler);
};


ResourceProvider.prototype.close = function close() {
	return Bluebird.bind(this).then(function () {
		if (this.mysql) {
			this.mysql.end();
			this.mysql = null;
		}
	}).catch(function (err) {
		logger.warn('Error while closing mysql connection.', err);
	});
};

module.exports = function (config, preLoadCallback) {
	var resourceProvider = new ResourceProvider(config);
	if (preLoadCallback) {
		preLoadCallback(resourceProvider);
	}
	return resourceProvider.load().return(resourceProvider);
};
