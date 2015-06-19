'use strict';

var Bluebird = require('bluebird'),
	Mysql = require('mysql'),
	_ = require('lodash');

var getLogger = require('../lib/logger');

var logger = getLogger('ResourceProvider');


var defaults = {
	db: {
		username: "root",
		password: "",
		database: "seinam",
		host: "localhost",
		port: 3306
	}
}

function ResourceProvider(config) {
	this.config = {
		db: _.defaults({}, config.db, defaults.db)
	};
	this.mysql = null;
}

ResourceProvider.prototype.connect = function connect() {
	if (this.mysql) {
		return Bluebird.reject(new Error('Already connected'));
	}

	var connection = Bluebird.promisifyAll(Mysql.createConnection(this.config.db));
	return connection.connectAsync().bind(this).then(function () {
		logger.info('Connected to mysql server %s', this.config.db.host + ':' + this.config.db.port);
		this.mysql = connection;
	}).return(this);
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

module.exports = function (config) {
	var resourceProvider = new ResourceProvider(config);
	return resourceProvider.connect().return(resourceProvider);
};
