/*
 * gumup
 * https://github.com/amsemy/gumup
 *
 * Copyright (c) 2014 Amsemy
 * Licensed under the MIT license.
 */

'use strict';

var GumupSpy = require('./gumup-spy');
var path = require('path');
var fs = require('fs');
var util = require('./util');

module.exports = function(options) {

    // Gumup spy constructor.
    var Gumup;

    // Current work dir.
    var cwd;

    // Encoding of the files.
    var encoding;

    // List of the external units.
    //
    //  {
    //      globals: ['<global_var_name>', ...],
    //      name: '<fake_unit_name>'
    //  }
    //
    var externals = [];

    // External units mapping to the Gumup units.
    //
    //  '<unit_file_path>': [<external_id>, ...]
    //
    var fileExternals = {};

    // List of the paths that are used to find the Gumup units.
    var unitPath = [];

    // List of the processed Gumup units.
    //
    //  {
    //      file: '<unit_file_path>',
    //      name: '<unit_name>',
    //      dependencies: ['<req_name>', ...]
    //  }
    //
    var unitCache = [];

    unitCache.readFile = function(fileName) {
        var file = path.resolve(cwd, fileName);
        return read(file);
    };

    unitCache.readUnit = function(name) {
        var fileName = name.split('.').join(path.sep) + '.js';
        var files = [];
        for (var i = 0, il = unitPath.length; i < il; i++) {
            var file = path.resolve(cwd, unitPath[i], fileName);
            if (fs.existsSync(file)) {
                files.push(file);
            }
        }
        if (!files.length) {
            throw util.error('Unable to find "' + name
                    + '" unit in the unit path');
        } else if (files.length > 1) {
            throw util.error('Too many files in the unit path for "'
                    + name + '" unit');
        }
        return read(files[0]);
    };

    parseOptions();

    function parseOptions() {
        // TODO: check options

        options = options || {};

        // Parse CWD.
        cwd = options.cwd || '';

        // Parse encoding.
        encoding = options.encoding || 'utf-8';

        // Parse externals.
        if (options.externals) {

            // Iterate over the each external unit.
            for (var e = 0, el = options.externals.length; e < el; e++) {
                var extDesc = options.externals[e],
                    extUnitName = null;

                // Add the external unit description.
                var extId = externals.push({
                    globals: extDesc.globals || []
                }) - 1;

                // Convert file list to the chain of fake Gumup units.
                if (extDesc.files) {
                    for (var f = 0, fl = extDesc.files.length; f < fl; f++) {
                        var extFile = path.resolve(cwd, extDesc.files[f]);

                        // Add the fake unit to the unit cache.
                        var extUnitDeps = (extUnitName ? [extUnitName] : []);
                        extUnitName = '#' + extId + '_' + f;
                        var extUnit = {
                            file: extFile,
                            name: extUnitName,
                            dependencies: extUnitDeps
                        };
                        unitCache.push(extUnit);
                    }
                    if (extUnitName) {
                        externals[extId].name = extUnitName;
                    }
                }

                // Add mapping to the Gumup units.
                if (extDesc.usages && extDesc.usages.length) {
                    for (var d = 0, dl = extDesc.usages.length; d < dl; d++) {
                        var file = path.resolve(cwd, extDesc.usages[d]);
                        if (!fileExternals[file]) {
                            fileExternals[file] = [];
                        }
                        fileExternals[file].push(extId);
                    }
                } else {
                    throw util.optionsError(
                            'Invalid using of "externals.usages" property');
                }
            }
        }

        // Parse gumupSpy.
        var gumupSpy = options.gumupSpy;
        Gumup = (gumupSpy ? gumupSpy(GumupSpy) || GumupSpy : GumupSpy);

        // Parse unitPath.
        unitPath = (options.unitPath && options.unitPath.length
                ? options.unitPath : ['.']);
    }

    function read(file) {
        var params = [],
            externalDeps = [];

        // Collect globals and external dependencies for the unit.
        var externalIds = fileExternals[file];
        if (externalIds) {
            for (var e = 0, el = externalIds.length; e < el; e++) {
                var external = externals[externalIds[e]];
                params.push.apply(params, external.globals);
                if (external.name) {
                    externalDeps.push(external.name);
                }
            }
        }

        // Read unit body.
        try {
            var unitBody = fs.readFileSync(file, encoding);
        } catch (e) {
            throw util.error('Unable to read "' + file + '" file', e);
        }

        // Read declaration from the unit body.
        var declaration = {
            file: file,
            dependencies: externalDeps
        };
        var values = params.slice();
        params.push('gumup');
        values.push(new Gumup(declaration));
        params.push(unitBody);
        try {
            Function.apply(null, params).apply(null, values);
        } catch (e) {
            throw util.error('Unable to parse "' + file + '" file', e);
        }

        return unitCache.push(declaration) - 1;
    }

    return unitCache;

};