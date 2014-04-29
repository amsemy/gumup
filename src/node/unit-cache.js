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

module.exports = function(grunt, fileCache, options) {

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
        return read(fileName);
    };

    unitCache.readUnit = function(name) {
        var fileName = name.split('.').join(path.sep) + '.js';
        var fileNames = [];
        for (var i = 0, il = unitPath.length; i < il; i++) {
            var file = path.resolve(cwd, unitPath[i], fileName);
            if (fs.existsSync(file)) {
                fileNames.push(file);
            }
        }
        if (!fileNames.length) {
            throw util.error('Unable to find "' + name
                    + '" unit in the unit path');
        } else if (fileNames.length > 1) {
            throw util.error('Too many files in the unit path for "'
                    + name + '" unit');
        }
        return read(fileNames[0]);
    };

    parseOptions();

    function parseOptions() {
        // TODO: check options

        // Parse CWD.
        cwd = options.cwd || '';

        // Parse encoding.
        encoding = options.encoding || 'utf8';

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
                for (var f = 0, fl = extDesc.files.length; f < fl; f++) {
                    var extFile = extDesc.files[f];

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

                // Add mapping to the Gumup units.
                for (var d = 0, dl = extDesc.dependencies.length; d < dl; d++) {
                    var file = extDesc.dependencies[d];
                    if (!fileExternals[file]) {
                        fileExternals[file] = [];
                    }
                    fileExternals[file].push(extId);
                }
            }
        }

        // Parse gumupSpy.
        var gumupSpy = options.gumupSpy;
        GumupSpy = (gumupSpy ? gumupSpy(GumupSpy) || GumupSpy : GumupSpy);

        // Parse unitPath.
        unitPath = options.unitPath;
    }

    function read(file) {
        var params = [],
            values = [],
            externalDeps = [];

        // Collect globals and external dependencies for the unit.
        var externalIds = fileExternals[file];
        for (var e = 0, el = externalIds.length; e < el; e++) {
            var external = externals[externalIds[e]];
            params.push.apply(params, external.globals);
            if (external.name) {
                externalDeps.push(name);
            }
        }

        // Read unit body.
        try {
            var unitBody = fs.readFileSync(file, encoding);
        } catch (e) {
            throw util.error('Unable to read "' + file + '" file');
        }

        // Read declaration from the unit body.
        var declaration = {
            file: file,
            dependencies: externalDeps
        };
        params.push('gumup');
        values.push(new GumupSpy(declaration));
        Function.apply(null, params.push(unitBody)).apply(null, values);

        return unitCache.push(declaration) - 1;
    }

    return unitCache;

};
