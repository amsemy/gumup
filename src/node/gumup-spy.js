/*
 * gumup
 * https://github.com/amsemy/gumup
 *
 * Copyright (c) 2014 Amsemy
 * Licensed under the MIT license.
 */

'use strict';

var util = require('./util');

var unitNamePattern = /^(?:[A-Za-z_\$][\w\$]*(?:\.[A-Za-z_\$][\w\$]*)*)$/,
    requireNamePattern = /^(?:[A-Za-z_\$][\w\$]*(?:\.[A-Za-z_\$][\w\$]*)*(?:\.\*)?|\*)$/;

var Declaration = function(spy) {
    this._spy = spy;
};

Declaration.prototype.require = function(reqName) {
    if (!checkRequireName(reqName)) {
        throw util.declError('Invalid require name "' + reqName
                + '" of "' + this._spy.name + '" unit');
    }
    this._spy.dependencies.push(reqName);
    return this;
};

var GumupSpy = function(spy) {
    this._spy = spy;
    this.units = {};
};

GumupSpy.prototype.constructor = GumupSpy;

GumupSpy.prototype.init = function() {};

GumupSpy.prototype.inject = function(settings) {};

GumupSpy.prototype.pick = function(settings) {};

GumupSpy.prototype.unit = function(name, implementation) {
    if (!checkUnitName(name)) {
        throw util.declError('Invalid unit name "' + name + '"');
    }
    if (typeof implementation != "function") {
        throw util.declError('Invalid implementation of "' + name + '" unit');
    }
    this._spy.name = name;
    return new this.Declaration(this._spy);
};

function checkRequireName(name) {
    return (name && requireNamePattern.test(name));
}

function checkUnitName(name) {
    return (name && unitNamePattern.test(name));
}

module.exports = GumupSpy;
