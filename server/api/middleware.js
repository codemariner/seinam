'use strict';

var api = {
};

api.auth_required = function(req, res, next) {
    if (!req.is_authenticated) {
        return next(new Error('Unauthorized access.'));
    }
    return next();
};

module.exports = api;
