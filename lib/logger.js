"use strict";

var winston = require("winston"),
	Promise = require('bluebird'),
	_ = require('lodash');

var loggers    = {},
	simpleLog  = winston.Logger.prototype.log,
	promiseLog = Promise.promisify(simpleLog),
	Logger;

winston.Logger.prototype.wouldLog = function(atLevel) { // winston doesn't have this; not sure why
	return _.some(this.transports, function(t,k){ return this.levels[atLevel] >= this.levels[t.level]; }, this);
};

winston.Logger.prototype.log = function (level, message, callback) {
	var self = this;

	if (!this.wouldLog(level)) {
		return;
	}

	if (_.isFunction(message)) {
		Promise.resolve(message())
			.then(function (_message) {
				var message = _.isArray(_message) ? _message : [_message];

				message.unshift(level);

				return promiseLog.apply(self, message);
			})
			.nodeify(callback);
	} else {
		simpleLog.apply(this, arguments);
	}
};

Logger = function (prefix, colorize) {
	var options, logger;

	if (colorize === undefined) {
		colorize = true;
	}
	prefix   = prefix || '';

	logger = loggers[prefix];
	if (!logger) {
		logger = {};
		loggers[prefix] = logger;
	}
	logger = logger[colorize];

	if (!logger) {
		options = {
			colorize: colorize,
			level: process.env.LOG_LVL || 'info',
			timestamp: true
		};
		if (prefix) {
			options.label = prefix;
		}
		logger = winston.loggers.add(prefix, { console: options });

		loggers[prefix] = logger;
	}

	return logger;
};

Logger.loggers = loggers;
Logger.winston = winston;

module.exports = Logger;
