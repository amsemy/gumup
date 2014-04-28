/*
 * gumup
 * https://github.com/amsemy/gumup
 *
 * Copyright (c) 2014 Amsemy
 * Licensed under the MIT license.
 */

'use strict';

var Namespace = function(unitCache) {
    this._units = [];
    this._unitCache = unitCache;
};

Namespace.prototype.add = function(fileName) {
    var unit = this._unitCache.readFile(fileName);
    this._units.push(unit);
};

Namespace.prototype.resolve = function() {
    var unitCache = this._unitCache,
        units = this._units;
    var namespace = [],
        processed = {},
        result = [];

    loadNamespace(namespace, units, unitCache);

    for (var i = 0, len = units.length; i < len; i++) {
        var queue = [units[i]];
        var stack = [];
        var direction = true;

        while (true) {
            // Move in queue or get back via stack.
            var unit = direction ? queue.shift() : stack.pop();
            // Skip processed units.
            if (direction && processed[unit]) {
                direction = false;
                continue;
            }
            // Check for existing unprocessed dependencies.
            var deps = getDependencies(unit, unitCache, namespace, processed);
            if (deps.length) {
                if (direction) {
                    queue.unshift(deps);
                }
                for (var s = 0, sLen = stack.length; s < sLen; s++) {
                    if (stack[s] === unit) {
                        error('Recursive dependency'); // TODO: print stack
                    }
                }
                stack.push(unit);
                direction = true;
            } else {
                processed[unit] = true;
                result.push(unitCache[unit].fileName);
                direction = false;
                // Check the exit point.
                if (!stack.length) {
                    break;
                }
            }
        }

    }
    return result;
};

function getDependencies(unit, unitCache, namespace, processed) {
    var deps = unitCache[unit].dependencies;
    var result = [];
    // Iterate over all unit dependencies.
    for (var i = 0, iLen = deps.length; i < iLen; i++) {
        var reqName = deps[i];
        var depUnit, j, jLen;
        if (reqName.charAt(reqName.length - 1) == "*") {
            // Iterate over uncapped `*` declarations.
            var baseName = reqName.substring(0, reqName.length - 1);
            for (j = 0, jLen = namespace.length; j < jLen; j++) {
                depUnit = namespace[j];
                if (unitCache[depUnit].name.indexOf(baseName) == 0
                        && !processed[depUnit]) {
                    result.push(depUnit);
                }
            }
        } else {
            // A simple dependency.
            for (j = 0, jLen = namespace.length; j < jLen; j++) {
                depUnit = namespace[j];
                if (unitCache[depUnit].name === reqName
                        && !processed[depUnit]) {
                    result.push(depUnit);
                    break;
                }
            }
            throw error("Invalid dependency '" + reqName + "'");
        }
    }
}

function loadNamespace(namespace, units, unitCache) {
    for (var i = 0, iLen = units.length; i < iLen; i++) {
        var unit = units[i];
        namespace.push(unit);
        var deps = unitCache[unit].dependencies;
        for (var j = 0, jLen = deps.length; j < jLen; j++) {
            // TODO: comment about `*`
            var reqUnit = unitCache.readUnit(deps[j]);
            namespace.push(reqUnit);
        }
    }
}

module.exports = Namespace;
