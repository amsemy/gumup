'use strict';

var UnitCache = require('../../src/node/unit-cache');
var path = require('path');

exports.unitCacheTest = {

    'UnitCache': {

        'GumupOptions~cwd': {

            'default value': function(test) {
                var fileName = 'test/node/fixtures/options/foo.js';
                var uc = UnitCache();
                var unit = uc.readFile(fileName);
                test.equal(uc[unit].file, path.resolve(fileName));
                test.done();
            },

            'specified value': function(test) {
                var cwd = 'test/node/fixtures/options',
                    fileName = 'foo.js';
                var uc = UnitCache({
                    cwd: cwd
                });
                var unit = uc.readFile(fileName);
                test.equal(uc[unit].file, path.resolve(cwd, fileName));
                test.done();
            }

        },

        'GumupOptions~encoding': {

            'default value': function(test) {
                var uc = UnitCache({
                    cwd: 'test/node/fixtures/options'
                });
                var unit = uc.readFile('foo.js');
                test.equal(uc[unit].name, 'foo');
                test.done();
            },

            'specified value': function(test) {
                var uc = UnitCache({
                    cwd: 'test/node/fixtures/options',
                    encoding: 'utf-16le'
                });
                var unit = uc.readFile('encoding_utf16.js');
                test.equal(uc[unit].name, 'encoding_utf16');
                test.done();
            }

        },

        'GumupOptions~externals': {

            'globals property with one value': function(test) {
                var uc = UnitCache({
                    cwd: 'test/node/fixtures/options',
                    externals: [
                        {
                            globals: ['extLib'],
                            usages: ['bar.js']
                        }
                    ]
                });
                var unit = uc.readFile('bar.js');
                test.equal(uc[unit].name, 'bar');
                test.done();
            },

            'globals property with many values': function(test) {
                var uc = UnitCache({
                    cwd: 'test/node/fixtures/options',
                    externals: [
                        {
                            globals: ['extLib', 'otherLib', 'extLib'],
                            usages: ['bar.js']
                        }
                    ]
                });
                var unit = uc.readFile('bar.js');
                test.equal(uc[unit].name, 'bar');
                test.done();
            },

            'files property with one file': function(test) {
                var cwd = 'test/node/fixtures/options',
                    fooFileName = 'foo.js',
                    extLibFileName = 'extLib.js';
                var uc = UnitCache({
                    cwd: cwd,
                    externals: [
                        {
                            files: [extLibFileName],
                            usages: [fooFileName]
                        }
                    ]
                });
                var unit;

                test.equal(uc[0].file, path.resolve(cwd, extLibFileName));
                test.equal(uc[0].name, '#0_0');
                test.deepEqual(uc[0].dependencies, []);

                unit = uc.readFile(fooFileName);

                test.equal(uc[unit].file, path.resolve(cwd, fooFileName));
                test.equal(uc[unit].name, 'foo');
                test.deepEqual(uc[unit].dependencies, ['#0_0']);

                test.done();
            },

            'files property with many files': function(test) {
                var cwd = 'test/node/fixtures/options',
                    fooFileName = 'foo.js',
                    extLibFileName = 'extLib.js',
                    otherLibFileName = 'otherLib.js';
                var uc = UnitCache({
                    cwd: cwd,
                    externals: [
                        {
                            files: [extLibFileName, otherLibFileName],
                            usages: [fooFileName]
                        }
                    ]
                });
                var unit;

                test.equal(uc[0].file, path.resolve(cwd, extLibFileName));
                test.equal(uc[0].name, '#0_0');
                test.deepEqual(uc[0].dependencies, []);

                test.equal(uc[1].file, path.resolve(cwd, otherLibFileName));
                test.equal(uc[1].name, '#0_1');
                test.deepEqual(uc[1].dependencies, ['#0_0']);

                unit = uc.readFile(fooFileName);

                test.equal(uc[unit].file, path.resolve(cwd, fooFileName));
                test.equal(uc[unit].name, 'foo');
                test.deepEqual(uc[unit].dependencies, ['#0_1']);

                test.done();
            },

            'all properties': function(test) {
                var cwd = 'test/node/fixtures/options',
                    fooFileName = 'foo.js',
                    barFileName = 'bar.js',
                    extLibFileName = 'extLib.js',
                    otherLibFileName = 'otherLib.js';
                var uc = UnitCache({
                    cwd: cwd,
                    externals: [
                        {
                            globals: ['extLib', 'otherLib'],
                            files: [extLibFileName, otherLibFileName],
                            usages: [fooFileName, barFileName]
                        }
                    ]
                });
                var unit;

                test.equal(uc[0].file, path.resolve(cwd, extLibFileName));
                test.equal(uc[0].name, '#0_0');
                test.deepEqual(uc[0].dependencies, []);

                test.equal(uc[1].file, path.resolve(cwd, otherLibFileName));
                test.equal(uc[1].name, '#0_1');
                test.deepEqual(uc[1].dependencies, ['#0_0']);

                unit = uc.readFile(fooFileName);

                test.equal(uc[unit].file, path.resolve(cwd, fooFileName));
                test.equal(uc[unit].name, 'foo');
                test.deepEqual(uc[unit].dependencies, ['#0_1']);

                unit = uc.readFile(barFileName);

                test.equal(uc[unit].file, path.resolve(cwd, barFileName));
                test.equal(uc[unit].name, 'bar');
                test.deepEqual(uc[unit].dependencies, ['#0_1']);

                test.done();
            }

        },

        'GumupOptions~gumupSpy': {

            'default value': function(test) {
                var uc = UnitCache({
                    cwd: 'test/node/fixtures/options'
                });
                var unit = uc.readFile('foo.js');
                test.equal(uc[unit].name, 'foo');
                test.done();
            },

            'extend existing': function(test) {
                var uc = UnitCache({
                    cwd: 'test/node/fixtures/options',
                    gumupSpy: function(GumupSpy) {
                        GumupSpy.prototype.module = GumupSpy.prototype.unit;
                    }
                });
                var unit = uc.readFile('baz.js');
                test.equal(uc[unit].name, 'baz');
                test.done();
            },

            'use custom': function(test) {
                var uc = UnitCache({
                    cwd: 'test/node/fixtures/options',
                    gumupSpy: function() {
                        var CustomGumupSpy = function(spy) {
                            this._spy = spy;
                        };
                        CustomGumupSpy.prototype.module = function(name) {
                            this._spy.name = name;
                        };
                        return CustomGumupSpy;
                    }
                });
                var unit = uc.readFile('baz.js');
                test.equal(uc[unit].name, 'baz');
                test.done();
            }

        },

        'GumupOptions~unitPath': {

            'default value': function(test) {
                var cwd = 'test/node/fixtures/options';
                var uc = UnitCache({
                    cwd: cwd
                });
                var unit = uc.readUnit('foo');
                test.equal(uc[unit].file, path.resolve(cwd, 'foo.js'));
                test.done();
            },

            'specified value': function(test) {
                var optionsPath = 'test/node/fixtures/options',
                    readPath = 'test/node/fixtures/read';
                var uc = UnitCache({
                    unitPath: [optionsPath, readPath]
                });
                var unit;

                unit = uc.readUnit('foo');
                test.equal(uc[unit].file, path.resolve(optionsPath, 'foo.js'));

                unit = uc.readUnit('main');
                test.equal(uc[unit].file, path.resolve(readPath, 'main.js'));

                unit = uc.readUnit('util.dux.dax');
                test.equal(uc[unit].file, path.resolve(readPath,
                        'util/dux/dax.js'));

                test.done();
            }

        }

    },

    'UnitCache.readFile': {

        'must read file to the unit cache': function(test) {
            var cwd = 'test/node/fixtures/read',
                fileName = 'main.js';
            var uc = UnitCache({
                cwd: cwd
            });
            var unit = uc.readFile(fileName);
            test.equal(uc[unit].file, path.resolve(cwd, fileName));
            test.equal(uc[unit].name, 'main');
            test.deepEqual(uc[unit].dependencies, ['util.foo', '*']);
            test.done();
        },

        'must use cache for readed files': function(test) {
            var cwd = 'test/node/fixtures/read',
                fileName = 'main.js';
            var uc = UnitCache({
                cwd: cwd
            });
            uc.readFile(fileName);
            test.equals(uc.length, 1);
            uc.readFile(fileName);
            test.equals(uc.length, 1);
            test.done();
        }

    },

    'UnitCache.readUnit': {

        'must read file to the unit cache': function(test) {
            var unitName = 'main',
                unitPath = 'test/node/fixtures/read';
            var uc = UnitCache({
                unitPath: [unitPath]
            });
            var unit = uc.readUnit(unitName);
            test.equal(uc[unit].file, path.resolve(unitPath, 'main.js'));
            test.equal(uc[unit].name, unitName);
            test.deepEqual(uc[unit].dependencies, ['util.foo', '*']);
            test.done();
        },

        'must use cache for readed files': function(test) {
            var unitName = 'main',
                unitPath = 'test/node/fixtures/read';
            var uc = UnitCache({
                unitPath: [unitPath]
            });
            uc.readUnit(unitName);
            test.equals(uc.length, 1);
            uc.readUnit(unitName);
            test.equals(uc.length, 1);
            test.done();
        },

        'must find collisions': function(test) {
            var uc = UnitCache({
                unitPath: [
                    'test/node/fixtures/options',
                    'test/node/fixtures/read'
                ]
            });
            test.throws(function() {
                uc.readUnit('baz');
            });
            test.done();
        }

    }
};
