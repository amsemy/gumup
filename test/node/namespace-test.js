'use strict';

var Namespace = require('../../src/node/namespace');

exports.unitCacheTest = {

    'Namespace': {

        'add': {

            'must add the specified unit to this namespace': function(test) {
                var uc = UnitCacheStub({
                    'a': []
                });
                var ns = new Namespace(uc);
                ns.add('a.js');
                test.equal(ns._units[0], 0);
                test.done();
            }

        },

        'constructor': {

            'must create a new namespace': function(test) {
                var uc = UnitCacheStub({});
                var ns = new Namespace(uc);
                test.deepEqual(ns._units, []);
                test.strictEqual(ns._unitCache, uc);
                test.done();
            }

        },

        'resolve': {

            'must resolve dependencies [ABCD]': function(test) {
                var uc = UnitCacheStub({
                    'a': [],
                    'b': ['a'],
                    'c': ['b'],
                    'd': ['a', 'c', 'b']
                });
                var ns = new Namespace(uc);
                ns.add('d.js');
                var files = ns.resolve();
                test.deepEqual(files, [
                    'a.js',
                    'b.js',
                    'c.js',
                    'd.js'
                ]);
                test.done();
            },

            'must resolve dependencies [ABCD] without required units': function(test) {
                var uc = UnitCacheStub({
                    'a': [],
                    'b': ['a'],
                    'c': ['b'],
                    'd': ['*']
                });
                var ns = new Namespace(uc);
                ns.add('d.js');
                var files = ns.resolve();
                test.deepEqual(files, [
                    'd.js'
                ]);
                test.done();
            },

            'must resolve dependencies [ABCD] with required units': function (test) {
                var uc = UnitCacheStub({
                    'a': [],
                    'b': ['a'],
                    'c': ['b'],
                    'd': ['*']
                });
                var ns = new Namespace(uc);
                ns.add('c.js');
                ns.add('a.js');
                ns.add('d.js');
                ns.add('b.js');
                var files = ns.resolve();
                test.deepEqual(files, [
                    'a.js',
                    'b.js',
                    'c.js',
                    'd.js'
                ]);
                test.done();
            },

            'must resolve dependencies [DCBA]': function(test) {
                var uc = UnitCacheStub({
                    'a': ['d', 'b', 'c'],
                    'b': ['c'],
                    'c': ['d'],
                    'd': []
                });
                var ns = new Namespace(uc);
                ns.add('a.js');
                var files = ns.resolve();
                test.deepEqual(files, [
                    'd.js',
                    'c.js',
                    'b.js',
                    'a.js'
                ]);
                test.done();
            },

            'must resolve dependencies [DCBA] without required units': function(test) {
                var uc = UnitCacheStub({
                    'a': ['*'],
                    'b': ['c'],
                    'c': ['d'],
                    'd': []
                });
                var ns = new Namespace(uc);
                ns.add('d.js');
                var files = ns.resolve();
                test.deepEqual(files, [
                    'd.js'
                ]);
                test.done();
            },

            'must resolve dependencies [DCBA] with required units': function (test) {
                var uc = UnitCacheStub({
                    'a': ['*'],
                    'b': ['c'],
                    'c': ['d'],
                    'd': []
                });
                var ns = new Namespace(uc);
                ns.add('b.js');
                ns.add('d.js');
                ns.add('a.js');
                ns.add('c.js');
                var files = ns.resolve();
                test.deepEqual(files, [
                    'd.js',
                    'c.js',
                    'b.js',
                    'a.js'
                ]);
                test.done();
            },

            'must resolve dependencies [Ab1b2___BCD]': function(test) {
                var uc = UnitCacheStub({
                    'a': [],
                    'b': ['b.*', 'a'],
                    'b.b1': ['a'],
                    'b.b2': ['b.b1'],
                    'b.b3._1': ['b.b2'],
                    'b.b3._2': ['b.b2'],
                    'b.b3._3': ['b.b2'],
                    'c': ['b'],
                    'd': ['*']
                });
                var ns = new Namespace(uc);
                ns.add('b.b1.js');
                ns.add('b.b2.js');
                ns.add('b.b3._1.js');
                ns.add('b.b3._2.js');
                ns.add('b.b3._3.js');
                ns.add('c.js');
                ns.add('d.js');
                var files = ns.resolve();
                test.deepEqual(files, [
                    'a.js',
                    'b.b1.js',
                    'b.b2.js',
                    'b.b3._1.js',
                    'b.b3._2.js',
                    'b.b3._3.js',
                    'b.js',
                    'c.js',
                    'd.js'
                ]);
                test.done();
            },

            'must resolve dependencies [KHJGDEABLIFC]': function(test) {
                var uc = UnitCacheStub({
                    'a': ['d', 'e'],
                    'b': ['e'],
                    'c': ['h', 'f'],
                    'd': ['g'],
                    'e': ['h'],
                    'f': ['i'],
                    'g': ['h', 'j'],
                    'h': ['k'],
                    'i': ['l'],
                    'j': ['k'],
                    'k': [],
                    'l': ['b', 'k']
                });
                var ns = new Namespace(uc);
                ns.add('a.js');
                ns.add('c.js');
                var files = ns.resolve();
                test.deepEqual(files, [
                    'k.js',
                    'h.js',
                    'j.js',
                    'g.js',
                    'd.js',
                    'e.js',
                    'a.js',
                    'b.js',
                    'l.js',
                    'i.js',
                    'f.js',
                    'c.js'
                ]);
                test.done();
            }

        }

    }

};

function UnitCacheStub(data) {

    var unitCache = [];

    for (var k in data) {
        unitCache.push({
            file: k + '.js',
            name: k,
            dependencies: data[k]
        })
    }

    unitCache.readFile = function(fileName) {
        for (var i = 0, il = unitCache.length; i < il; i++) {
            if (unitCache[i].file == fileName) {
                return i;
            }
        }
        throw new Error('Can\'t find file ' + fileName
                + ' in the unit cache stub');
    };

    unitCache.readUnit = function(name) {
        for (var i = 0, il = unitCache.length; i < il; i++) {
            if (unitCache[i].name == name) {
                return i;
            }
        }
        throw new Error('Can\'t find unit ' + name + ' in the unit cache stub');
    };

    return unitCache;
}
