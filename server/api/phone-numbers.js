'use strict';

var express = require('express');
var router = express.Router();

function phoneNumberLookup(scripts, dao) {
	return function (req, res, next) {
		var scripts = resourceAdapter.scriptHandler;
		scripts.executeFirst(req.params.number).then(function (output) {
			res.send(output);
			return next();
		});
	}
}


module.exports = function(resourceProvider) {
	router.get('/phone_numbers/:number', phoneNumberLookup(resourceProvider.scriptHandler, resourceProvider.dao));
	return router;
}
