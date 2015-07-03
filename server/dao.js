'use strict';

var config = require('config'),
	moment = require('moment'),
	getLogger = require('../lib/logger'),
	logger = getLogger('dao'),
	validTtlMinutes = config.get('phone_numbers.valid_ttl_mins') || 43200,
	invalidTtlMinutes = config.get('phone_numbers.invalid_ttl_mins') || 1400;


function Dao(myslConn) {
	this.mysql = myslConn;
}

Dao.prototype.findAccountByApiToken = function (token) {
	return this.mysql.queryAsync('SELECT * from `customers` WHERE `api_token` = ?', token).then(function (results, fields) {
		if (results.length && results[0].length) {
			return results[0][0];
		}
	});
}

Dao.prototype.findPhoneNumber = function (phoneNumber) {
	return this.mysql.queryAsync('SELECT * from `phone_numbers` WHERE `number` = ?', phoneNumber).then(function (results, fields) {
		if (results.length && results[0].length) {
			return results[0][0];
		}
	});
}

Dao.prototype.insertPhoneNumber = function (phoneNumber, displayText, validated) {
	return this.mysql.queryAsync(
		'INSERT INTO `phone_numbers` (number, display, validated, created_at, updated_at, expires_at) ' +
		'VALUES (?, ?, ?, ?, ?, ?)',
		[phoneNumber, displayText, !!validated, new Date(), new Date(), getExpiration(validated)]);
}

Dao.prototype.updatePhoneNumber = function (phoneNumber, displayText, validated) {
	return this.mysql.queryAsync(
		'UPDATE `phone_numbers` SET ' +
		' number = ?, ' +
		' display = ?, ' +
		' validated = ?, ' +
		' created_at = ?, ' +
		' updated_at = ?, ' +
		' expires_at = ? ' +
		' WHERE number = ?',
		[phoneNumber, displayText, !!validated, new Date(), new Date(), getExpiration(validated), phoneNumber]);
}

Dao.prototype.upsertPhoneNumber = function (phoneNumber, displayText, validated) {
	return this.mysql.queryAsync(
		'INSERT INTO `phone_numbers` (number, display, validated, created_at, updated_at, expires_at) ' +
		'VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY update ' +
		' number = ?, ' +
		' display = ?, ' +
		' validated = ?, ' +
		' created_at = ?, ' +
		' updated_at = ?, ' +
		' expires_at = ? ',
		[phoneNumber, displayText, !!validated, new Date(), new Date(), getExpiration(validated),
		 phoneNumber, displayText, !!validated, new Date(), new Date(), getExpiration(validated)]);
}

Dao.prototype.deletePhoneNumber = function (number) {
	return this.mysql.queryAsync('DELETE FROM phone_numbers WHERE number = ?', number)
}

Dao.prototype._flushPhoneNumbers = function () {
	return this.mysql.queryAsync('TRUNCATE TABLE phone_numbers');
};


function getExpiration(validated) {
	if (validated) {
		return moment().add(validTtlMinutes, 'minutes').toDate();
	}
	return moment().add(invalidTtlMinutes, 'minutes').toDate();
}

module.exports = Dao;
