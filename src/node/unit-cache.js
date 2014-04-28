/*
 * gumup
 * https://github.com/amsemy/gumup
 *
 * Copyright (c) 2014 Amsemy
 * Licensed under the MIT license.
 */

'use strict';

var GumupSpy = require('./gumup-spy');

module.exports = function(grunt, fileCache, options) {

    GumupSpy = parseGumupSpy(options.gumupSpy);

    var globals = parseGloabals(options.globals);

    var unitCache = [
        {
            fileName: '/h/unitName',
            name: 'unitName',
            dependencies: [
                'foo',
                'bar'
            ]
        }
    ];

    var unitPath = parseUnitPath(options.unitPath);

    unitCache.readFile = function(fileName) {
        // TODO: check file exists
        return read(fileName);
    };

    unitCache.readUnit = function(name) {
        var sep = grunt.getEnv,
            unitPath = options.unitPath;
        var fileNames = [];
        for (var i = 0, len = unitPath.length; i < len; i++) {
grunt.file.exists
        }

        return read(fileName[0]);
    };

    function parseGlobals(globals) {
        // TODO:
    }

    function parseGumupSpy(gumupSpy) {
        return (gumupSpy ? gumupSpy(GumupSpy) || GumupSpy : GumupSpy);
    }

    function parseUnitPath(unitPath) {
        // TODO:
    }

    function read(fileName) {
        var enviroment = options.enviroment;
        var buffer = fileCache.readFile(fileName),
            decl = {
                fileName: fileName
            },
            params = [],
            values = [];
        enviroment.gumup = new GumupSpy(decl);
        for (var e in enviroment) {
            params.push(e);
            values.push(enviroment[e]);
        }
        params.push(buffer);
        Function.apply(null, params).apply(null, values);
        return unitCache.push(decl) - 1;
    }

    return unitCache;

};
