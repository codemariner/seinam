'use strict';


var api = {
};

function Dao(resourceProvider) {
	this.mysql = resourceProvider.mysql;
}

Dao.prototype.findPhoneNumber = function (phoneNumber) {
	console.log('findPhoneNumber', phoneNumber);
	return this.mysql.queryAsync('SELECT * from `phone_numbers` WHERE `number` = ?', phoneNumber).then(function (results, fields) {
		if (results.length) {
			return results[0];
		}
	});
}

Dao.prototype.upsertPhoneNumber = function (phoneNumber, displayText, validated) {
	return this.mysql.queryAsync(
		'INSERT INTO `phone_numbers` (number, display, validated, created_at, updated_at) ' +
		'VALUES (?, ?, now(), now()) ON DUPLICATE KEY update ' +
		' number = ?, ' +
		' display = ?, ' +
		' validated = 0, ' +
		' updated_at = now()',
		[phoneNumber, displayText,
		 phoneNumber, displayText]);
}

module.exports = Dao;
