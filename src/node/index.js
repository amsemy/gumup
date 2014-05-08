/*
 * gumup
 * https://github.com/amsemy/gumup
 *
 * Copyright (c) 2014 Amsemy
 * Licensed under the MIT license.
 */

'use strict';

var Namespace = require('./namespace');
var UnitCache = require('./unit-cache');

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
 * @param  {Function} GumupSpy
 *         Current implementation of the GumupSpy that can be extended.
 * @returns  {undefined|Function}
 *           A custom implementation. If is undefined, then the default
 *           implementation will be used.
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

/**
 * Create the Gumup module.
 *
 * @constructor
 * @param  {GumupOptions} [options]
 *         Module options.
 */
var Gumup = function(options) {
    this._unitCache = UnitCache(options);
};

/**
 * Resolve the unit dependencies.
 *
 * @returns  {string[]}
 *           Resolved file paths.
 */
Gumup.prototype.resolve = function(files) {
    var ns = new Namespace(this._unitCache);
    for (var i = 0, il = files.length; i < il; i++) {
        ns.add(files[i]);
    }
    return ns.resolve();
};

module.exports = Gumup;
