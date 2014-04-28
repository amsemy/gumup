/*
 * gumup
 * https://github.com/amsemy/gumup
 *
 * Copyright (c) 2014 Amsemy
 * Licensed under the MIT license.
 */

'use strict';

var unitNamePattern = /^(?:[A-Za-z_\$][\w\$]*(?:\.[A-Za-z_\$][\w\$]*)*)$/,
    requireNamePattern = /^(?:[A-Za-z_\$][\w\$]*(?:\.[A-Za-z_\$][\w\$]*)*(?:\.\*)?|\*)$/;

var Declaration = function(spy) {
    this._spy = spy;
};

Declaration.prototype.require = function(reqName) {
    if (!checkRequireName(reqName)) {
        error('Invalid require name "' + reqName + '"');
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
        error('Invalid unit name "' + name + '"');
    }
    if (typeof implementation != "function") {
        error('Invalid implementation of "' + name + '" unit');
    }
    this._spy.name = name;
    this._spy.dependencies = [];
    return new this.Declaration(this._spy);
};

function checkRequireName(name) {
    return (name && requireNamePattern.test(name));
}

function checkUnitName(name) {
    return (name && unitNamePattern.test(name));
}

function error(msg) {
    var err = new Error(msg);
    err.name = 'GumupError';
    throw err;
}

module.exports = GumupSpy;
