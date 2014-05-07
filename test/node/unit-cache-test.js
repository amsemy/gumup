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
                var cwd = 'test/node/fixtures/options';
                var uc = UnitCache({
                    cwd: cwd
                });
                var unit = uc.readFile('foo.js');
                test.equal(uc[unit].file, path.resolve(cwd, 'foo.js'));
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
                var cwd = 'test/node/fixtures/options';
                var uc = UnitCache({
                    cwd: cwd,
                    externals: [
                        {
                            files: ['extLib.js'],
                            usages: ['foo.js']
                        }
                    ]
                });
                var unit;

                test.equal(uc[0].file, path.resolve(cwd, 'extLib.js'));
                test.equal(uc[0].name, '#0_0');
                test.deepEqual(uc[0].dependencies, []);

                unit = uc.readFile('foo.js');

                test.equal(uc[unit].file, path.resolve(cwd, 'foo.js'));
                test.equal(uc[unit].name, 'foo');
                test.deepEqual(uc[unit].dependencies, ['#0_0']);

                test.done();
            },

            'files property with many files': function(test) {
                var cwd = 'test/node/fixtures/options';
                var uc = UnitCache({
                    cwd: cwd,
                    externals: [
                        {
                            files: ['extLib.js', 'otherLib.js'],
                            usages: ['foo.js']
                        }
                    ]
                });
                var unit;

                test.equal(uc[0].file, path.resolve(cwd, 'extLib.js'));
                test.equal(uc[0].name, '#0_0');
                test.deepEqual(uc[0].dependencies, []);

                test.equal(uc[1].file, path.resolve(cwd, 'otherLib.js'));
                test.equal(uc[1].name, '#0_1');
                test.deepEqual(uc[1].dependencies, ['#0_0']);

                unit = uc.readFile('foo.js');

                test.equal(uc[unit].file, path.resolve(cwd, 'foo.js'));
                test.equal(uc[unit].name, 'foo');
                test.deepEqual(uc[unit].dependencies, ['#0_1']);

                test.done();
            },

            'all properties': function(test) {
                var cwd = 'test/node/fixtures/options';
                var uc = UnitCache({
                    cwd: cwd,
                    externals: [
                        {
                            globals: ['extLib', 'otherLib'],
                            files: ['extLib.js', 'otherLib.js'],
                            usages: ['foo.js', 'bar.js']
                        }
                    ]
                });
                var unit;

                test.equal(uc[0].file, path.resolve(cwd, 'extLib.js'));
                test.equal(uc[0].name, '#0_0');
                test.deepEqual(uc[0].dependencies, []);

                test.equal(uc[1].file, path.resolve(cwd, 'otherLib.js'));
                test.equal(uc[1].name, '#0_1');
                test.deepEqual(uc[1].dependencies, ['#0_0']);

                unit = uc.readFile('foo.js');

                test.equal(uc[unit].file, path.resolve(cwd, 'foo.js'));
                test.equal(uc[unit].name, 'foo');
                test.deepEqual(uc[unit].dependencies, ['#0_1']);

                unit = uc.readFile('bar.js');

                test.equal(uc[unit].file, path.resolve(cwd, 'bar.js'));
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
            var cwd = 'test/node/fixtures/read';
            var uc = UnitCache({
                cwd: cwd
            });
            var unit = uc.readFile('main.js');
            test.equal(uc[unit].file, path.resolve(cwd, 'main.js'));
            test.equal(uc[unit].name, 'main');
            test.deepEqual(uc[unit].dependencies, ['util.foo', '*']);
            test.done();
        },

        'must use cache for readed files': function(test) {
            var cwd = 'test/node/fixtures/read';
            var uc = UnitCache({
                cwd: cwd
            });
            uc.readFile('main.js');
            test.equals(uc.length, 1);
            uc.readFile('main.js');
            test.equals(uc.length, 1);
            test.done();
        }

    },

    'UnitCache.readUnit': {

        'must read file to the unit cache': function(test) {
            var unitPath = 'test/node/fixtures/read';
            var uc = UnitCache({
                unitPath: [unitPath]
            });
            var unit = uc.readUnit('main');
            test.equal(uc[unit].file, path.resolve(unitPath, 'main.js'));
            test.equal(uc[unit].name, 'main');
            test.deepEqual(uc[unit].dependencies, ['util.foo', '*']);
            test.done();
        },

        'must use cache for readed files': function(test) {
            var uc = UnitCache({
                unitPath: ['test/node/fixtures/read']
            });
            uc.readUnit('main');
            test.equals(uc.length, 1);
            uc.readUnit('main');
            test.equals(uc.length, 1);
            test.done();
        },

        'must use cache for external units': function(test) {
            var uc = UnitCache({
                cwd: 'test/node/fixtures/options',
                externals: [
                    {
                        globals: ['extLib'],
                        files: ['extLib.js'],
                        usages: ['bar.js']
                    }
                ]
            });
            test.equal(uc.readUnit('#0_0'), 0);
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
