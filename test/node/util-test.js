'use strict';

var util = require('../../src/node/util');

exports.utilTest = {

    'util.Set': {

        'add': {

            'must add the specified element to this set if it is not already present': function(test) {
                var collection = new util.Set();
                test.ok(collection.add(1));
                test.ok(collection.add('1'));
                test.ok(collection.add(null));
                test.ok(!collection.add(1));
                test.ok(!collection.add('1'));
                test.ok(!collection.add(null));
                test.equal(collection[0], 1);
                test.equal(collection[1], '1');
                test.equal(collection[2], null);
                test.done();
            }

        },

        'constructor': {

            'must create a new, empty set': function(test) {
                var collection = new util.Set();
                test.equal(collection.length, 0);
                test.done();
            },

            'must create a new set containing the elements in the specified collection': function(test) {
                var collection = new util.Set([123, 'abc', null]);
                test.equal(collection[0], 123);
                test.equal(collection[1], 'abc');
                test.equal(collection[2], null);
                test.done();
            }

        },

        'contains': {

            'must returns `true` if this set contains the specified element': function(test) {
                var collection = new util.Set([1, '1', 2, '3']);
                test.ok(collection.contains(1));
                test.ok(collection.contains('1'));
                test.ok(collection.contains(2));
                test.ok(!collection.contains('2'));
                test.ok(!collection.contains(3));
                test.ok(collection.contains('3'));
                test.done();
            }

        }

    }

};