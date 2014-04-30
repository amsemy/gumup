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

                test.equal(uc[0].file, path.resolve(cwd, extLibFileName));
                test.equal(uc[0].name, '#0_0');
                test.deepEqual(uc[0].dependencies, []);

                var unit = uc.readFile(fooFileName);

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
                test.equal(uc[0].file, path.resolve(cwd, extLibFileName));
                test.equal(uc[0].name, '#0_0');
                test.deepEqual(uc[0].dependencies, []);

                test.equal(uc[1].file, path.resolve(cwd, otherLibFileName));
                test.equal(uc[1].name, '#0_1');
                test.deepEqual(uc[1].dependencies, ['#0_0']);

                var unit = uc.readFile(fooFileName);

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

                test.equal(uc[0].file, path.resolve(cwd, extLibFileName));
                test.equal(uc[0].name, '#0_0');
                test.deepEqual(uc[0].dependencies, []);

                test.equal(uc[1].file, path.resolve(cwd, otherLibFileName));
                test.equal(uc[1].name, '#0_1');
                test.deepEqual(uc[1].dependencies, ['#0_0']);

                var unit = uc.readFile(fooFileName);

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

        }

    },

    'UnitCache.readFile': {

        'foo': function(test) {
            test.ok(true);
            test.done();
        }

    },

    'UnitCache.readUnit': {

        'bar': function(test) {
            test.ok(true);
            test.done();
        }

    }
};
