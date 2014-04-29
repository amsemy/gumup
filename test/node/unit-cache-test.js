'use strict';

var UnitCache = require('../../src/node/unit-cache');

exports.unitCacheTest = {

    'UnitCache': {

        'GumupOptions~cwd': {

            'specified value': function(test) {
                var uc = UnitCache({
                    cwd: 'test/node/fixtures',
                    unitPath: '.'
                });
                var unit = uc.readFile('foo.js');
                test.ok(uc[unit].name, 'foo');
                test.done();
            },

            'default value': function(test) {
                var uc = UnitCache({
                    unitPath: '.'
                });
                var unit = uc.readFile('test/node/fixtures/foo.js');
                test.ok(uc[unit].name, 'foo');
                test.done();
            }

        },

        'GumupOptions~encoding': {

            'specified value': function(test) {
                var uc = UnitCache({
                    cwd: 'test/node/fixtures',
                    encoding: 'utf16le',
                    unitPath: '.'
                });
                var unit = uc.readFile('encoding_utf16.js');
                test.ok(uc[unit].name, 'encoding_utf16');
                test.done();
            },

            'default value': function(test) {
                var uc = UnitCache({
                    cwd: 'test/node/fixtures',
                    unitPath: '.'
                });
                var unit = uc.readFile('foo.js');
                test.ok(uc[unit].name, 'foo');
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
