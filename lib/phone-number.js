'use strict';

var PNF = require('google-libphonenumber').PhoneNumberFormat,
	phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance(),
	_ = require('lodash');


module.exports = function(number) {
	var result = {
		formattedNumber: undefined,
		isInternational: false,
		parsedNumber: undefined
	};
	var parsed = phoneUtil.parseAndKeepRawInput(number, 'US');
	result.parsedNumber = parsed;

	if (phoneUtil.isPossibleNumber(parsed)) {
		var countryCode = parsed.getCountryCode();
		if (countryCode === 1) {
			result.formattedNumber = parsed.getNationalNumber();
		} else {
			result.isInternational = true;
			// international number
			var i18nPhone = phoneUtil.format(parsed, PNF.E164);
			// drop the leading '+'
			result.formattedNumber = i18nPhone.substring(1);
		}
	}
	return result;
};
