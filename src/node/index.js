/*
 * gumup
 * https://github.com/amsemy/gumup
 *
 * Copyright (c) 2014 Amsemy
 * Licensed under the MIT license.
 */

'use strict';

var unitCache = require('./unit-cache');
var gumupNamespace = require('./namespace');

/**
 * Lets to use external units in the gumup units.
 *
 * @namespace  GumupOptions~externals
 * @property  {string[]} [globals]
 *            Global variables that are occuped by the external unit.
 * @property  {string[]} [files]
 *            Files of the external unit.
 * @property  {string[]} usages
 *            Gumup unit files that depends from this unit.
 */

/**
 * Is used to extend the Gumup functionality.
 *
 * @callback  GumupOptions~gumupSpy
 * TODO: @param  {Function} GumupSpy
 *         The base implementation.
 * TODO: @returns  {undefined|Function}
 *
 */

/**
 * @namespace  GumupOptions
 * @property  {string} [cwd='.']
 *            Current work dir.
 * @property  {string} [encoding='utf-8']
 *            Unit files encoding.
 * @property  {GumupOptions~externals[]} [externals=[]]
 *            External units description.
 * @property  {GumupOptions~gumupSpy} [gumupSpy=GumupSpy]
 *            Constructor of the GumupSpy, used to parse the Gumup units.
 * @property  {string[]} [unitPath=['.']]
 *            Paths that are used to find the Gumup units (absolute or relative
 *            to `cwd`).
 */

module.exports = function(options) {

    var unitCache = unitCache();

    return {
        create: function() {

        }
    };

};
