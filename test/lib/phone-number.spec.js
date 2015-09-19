'use strict';

var assert = require('assert');

var _ = require('lodash');

var testNumbers = require('../sample-numbers'),
	parseNumber = require('../../lib/phone-number');

describe('phone-numbers', function () {
	
	it('should handle all numbers as expected', function () {
		_.each(_.keys(testNumbers), function (number) {
			var expected = testNumbers[number];
			try {
				var result = parseNumber(number);
				if (typeof expected === 'string') {
					assert.equal(result.formattedNumber, expected);
				} else if (expected === Error) {
					assert.fail('Expected error when parsing', number);
				} else {
					assert.fail('unknown expected result for', number);
				}
			} catch (e) {
				if (expected !== Error) {
					assert.fail('Unexpected error parsing', number, e.stack || e);
				}
			}
		});
	});

});

