'use strict';

var Namespace = require('../../src/node/namespace');

exports.unitCacheTest = {

    'Namespace': {

        'must create instance': function(test) {
            var uc = UnitCacheStub({});
            var ns = new Namespace(uc);
            test.deepEqual(ns._units, []);
            test.strictEqual(ns._unitCache, uc);
            test.done();
        }

    },

    'Namespace.add': {

        'must add unit to namespace': function(test) {
            var uc = UnitCacheStub({
                'a': []
            });
            var ns = new Namespace(uc);
            ns.add('a.js');
            test.equal(ns._units[0], 0);
            test.done();
        }

    },

    'Namespace.resolve': {

        'must resolve dependencies': function(test) {
            var uc = UnitCacheStub({
                'a': [],
                'b': ['a'],
                'c': ['b'],
                'd': ['a', 'c', 'b']
            });
            var ns = new Namespace(uc);
            ns.add('d.js');
            ns.resolve();
            // TODO
            test.done();
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
