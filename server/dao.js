'use strict';


var api = {
};

function Dao(myslConn) {
	this.mysql = myslConn;
}

Dao.prototype.findAccountByApiToken = function (token) {
	this.mysql.queryAsync('SELECT * from `customers` WHERE `api_token` = ?', token).then(function (results, fields) {
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

Dao.prototype.upsertPhoneNumber = function (phoneNumber, displayText, validated) {
	return this.mysql.queryAsync(
		'INSERT INTO `phone_numbers` (number, display, validated) ' +
		'VALUES (?, ?, ?) ON DUPLICATE KEY update ' +
		' number = ?, ' +
		' display = ?, ' +
		' validated = ? '
		[phoneNumber, displayText, validated,
		 phoneNumber, displayText, validated]);
}

module.exports = Dao;
