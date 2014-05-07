/*
 * gumup
 * https://github.com/amsemy/gumup
 *
 * Copyright (c) 2014 Amsemy
 * Licensed under the MIT license.
 */

'use strict';

var util = require('./util');

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
    var namespace = new util.Set(),
        processed = new util.Set(),
        result = [];

    loadNamespace(namespace, units, unitCache);

    for (var i = 0, il = units.length; i < il; i++) {
        var queue = [units[i]];
        var stack = [];
        var direction = true;

        while (true) {

            // Move in queue or get back via stack.
            var unit = direction ? queue.shift() : stack.pop();
            if (unit == null) {
                break;
            }
            // Skip processed units.
            if (direction && processed.contains(unit)) {
                direction = false;
                continue;
            }
            // Check for existing unprocessed dependencies.
            var deps = getDependencies(unit, unitCache, namespace, processed);
            if (deps.length) {
                if (direction) {
                    queue.unshift.apply(queue, deps);
                }
                for (var s = 0, sl = stack.length; s < sl; s++) {
                    if (stack[s] === unit) {
                        stack.push(unit);
                        throw util.error('Recursive dependency',
                                getStackDetails(stack, unitCache));
                    }
                }
                stack.push(unit);
                direction = true;
            } else {
                processed.add(unit);
                result.push(unitCache[unit].file);
                direction = false;
            }
        }

    }
    return result;
};

function getDependencies(unit, unitCache, namespace, processed) {
    var deps = unitCache[unit].dependencies;
    var result = [];
    // Iterate over all unit dependencies.
    unitDeps:
    for (var i = 0, il = deps.length; i < il; i++) {
        var reqName = deps[i];
        var depUnit, j, jl;
        if (reqName.charAt(reqName.length - 1) === '*') {
            // Iterate over uncapped `*` declarations.
            var baseName = reqName.substring(0, reqName.length - 1);
            for (j = 0, jl = namespace.length; j < jl; j++) {
                depUnit = namespace[j];
                if (unitCache[depUnit].name.indexOf(baseName) === 0
                        && depUnit !== unit
                        && !processed.contains(depUnit)) {
                    result.push(depUnit);
                }
            }
        } else {
            // A simple dependency.
            for (j = 0, jl = namespace.length; j < jl; j++) {
                depUnit = namespace[j];
                if (unitCache[depUnit].name === reqName) {
                    if (!processed.contains(depUnit)) {
                        result.push(depUnit);
                    }
                    continue unitDeps;
                }
            }
            throw util.error('Invalid dependency "' + reqName + '"');
        }
    }
    return result;
}

function getStackDetails(stack, unitCache) {
    var details = [];
    for (var i = 0, il = stack.length; i < il; i++) {
        details.push(unitCache[stack[i]].name);
    }
    return details;
}

function loadNamespace(namespace, units, unitCache) {
    for (var i = 0, il = units.length; i < il; i++) {
        var queue = new util.Set([units[i]]);
        while (true) {
            // Move in queue.
            var unit = queue.pop();
            if (unit == null) {
                break;
            }
            namespace.add(unit);
            // Read unit dependencies.
            var deps = unitCache[unit].dependencies;
            for (var j = 0, jl = deps.length; j < jl; j++) {
                var reqName = deps[j];
                if (reqName.charAt(reqName.length - 1) !== '*') {
                    var reqUnit = unitCache.readUnit(reqName);
                    if (!namespace.contains(reqUnit)) {
                        queue.add(reqUnit);
                    }
                }
            }
        }
    }
}

module.exports = Namespace;
