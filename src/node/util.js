/*
 * gumup
 * https://github.com/amsemy/gumup
 *
 * Copyright (c) 2014 Amsemy
 * Licensed under the MIT license.
 */

'use strict';

var Set = function() {
    if (arguments[0]) {
        this.push.apply(this, arguments[0]);
    }
};

Set.prototype = Object.create(Array.prototype);

Set.prototype.add = function(key) {
    if (this.contains(key)) {
        return false;
    } else {
        this.push(key);
        return true;
    }
};

Set.prototype.constructor = Set;

Set.prototype.contains = function(key) {
    return (Array.prototype.indexOf.call(this, key) >= 0);
};

exports.Set = Set;

exports.declError = function(msg) {
    var err = new Error(msg);
    err.name = 'GumupDeclarationError';
    return err;
};

exports.error = function(msg, details) {
    var err = new Error(msg);
    err.name = 'GumupError';
    if (details) {
        err.details = details;
    }
    return err;
};

exports.isArray = function(obj) {
    return Object.prototype.toString.call(obj) == "[object Array]";
};

exports.optionsError = function(msg) {
    var err = new Error(msg);
    err.name = 'GumupOptionsError';
    return err;
};
