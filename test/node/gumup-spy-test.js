'use strict';

var GumupSpy = require('../../src/node/gumup-spy');

var decl, ns;

var validNames = [
    "a",
    "a1",
    "a$",
    "a_",
    "aaa",
    "aaa.a11",
    "aaa.$$$.___",
    "$",
    "$1",
    "$a",
    "$_",
    "$$$",
    "$$$.$11",
    "$$$.___.aaa",
    "_",
    "_1",
    "_a",
    "_$",
    "___",
    "___._11",
    "___.aaa.$$$",
    "AAA",
    "AAA.BBB",
    "T.s._.$.AbC123.__dEF__.$$gHi$$"
];

var requiredNames = [
    "*",
    "aaa.*",
    "aaa.a11.*",
    "aaa.$$$.*",
    "T.s._.$.AbC123.__dEF__.*"
];

var invalidNames = [
    "",
    "1",
    "1*",
    "1234",
    "1aaa",
    "1aaa.",
    "1aaa.bbb",
    "1aaa.*",
    "1aaa.bbb.",
    "1aaa.bbb.*",
    "aaa.1bbb",
    "*aaa",
    "*aaa.",
    "*aaa.bbb",
    "*aaa.bbb.",
    "*aaa.bbb.*",
    "aaa*",
    "aaa*.",
    "aaa*.bbb",
    "aaa*.bbb.",
    "aaa*.bbb.*",
    "a*b*c",
    ".",
    "..",
    ".*",
    ".123",
    ".aaa",
    "aaa.",
    "aaa.bbb.",
    "**"
];

var objectNames = [
    undefined,
    null,
    111,
    [],
    {},
    function() {}
];

exports.file_cache = {

    setUp: function(callback) {
        decl = {
            file: 'file_name',
            dependencies: []
        };
        ns = new GumupSpy(decl);
        callback();
    },

    'GumupSpy': function(test) {
        test.equal(decl.file, 'file_name');
        test.deepEqual(decl.dependencies, []);
        test.done();
    },

    'GumupSpy.init': {
        'must exists': function(test) {
            ns.init();
            test.equals(typeof module.require, 'function');
            test.done();
        }
    },

    'GumupSpy.inject': {
        'must exists': function(test) {
            ns.inject();
            test.equals(typeof module.require, 'function');
            test.done();
        }
    },

    'GumupSpy.pick': {
        'must exists': function(test) {
            ns.pick();
            test.equals(typeof module.require, 'function');
            test.done();
        }
    },

    'GumupSpy.unit': {

        'must create a unit': function(test) {
            var module = ns.unit('aaa', function() {});
            test.equals(typeof module.require, 'function');
            test.done();
        },

        'must accept a valid unit name': function(test) {
            var i, il, name;
            for (i = 0, il = validNames.length; i < il; i++) {
                name = validNames[i];
                test.doesNotThrow(function() {
                    ns.unit(name, function() {});
                });
            }
            for (i = 0, il = requiredNames.length; i < il; i++) {
                name = requiredNames[i];
                test.throws(function() {
                    ns.unit(name, function() {});
                });
            }
            for (i = 0, il = invalidNames.length; i < il; i++) {
                name = invalidNames[i];
                test.throws(function() {
                    ns.unit(name, function() {});
                });
            }
            for (i = 0, il = objectNames.length; i < il; i++) {
                name = objectNames[i];
                test.throws(function() {
                    ns.unit(name, function() {});
                });
            }
            test.done();
        },

        'must accept a valid unit implementation': function(test) {
            test.doesNotThrow(function() {
                ns.unit('valid', function() {});
            });
            test.throws(function() {
                ns.unit('invalid.undefined');
            });
            test.throws(function() {
                ns.unit('invalid.null');
            });
            test.throws(function() {
                ns.unit('invalid.number', 123);
            });
            test.throws(function() {
                ns.unit('invalid.string', "abc");
            });
            test.throws(function() {
                ns.unit('invalid.array', []);
            });
            test.throws(function() {
                ns.unit('invalid.object', {});
            });
            test.done();
        }

    },

    'Declaration.require': {

        'must accept a valid required unit name': function(test) {
            var i, il, name;
            for (i = 0, il = validNames.length; i < il; i++) {
                name = validNames[i];
                test.doesNotThrow(function() {
                    ns.unit('V' + i, function() {}).require(name);
                });
            }
            for (i = 0, il = requiredNames.length; i < il; i++) {
                name = requiredNames[i];
                test.doesNotThrow(function() {
                    ns.unit('R' + i, function() {}).require(name);
                });
            }
            for (i = 0, il = invalidNames.length; i < il; i++) {
                name = invalidNames[i];
                test.throws(function() {
                    ns.unit('I' + i, function() {}).require(name);
                });
            }
            for (i = 0, il = objectNames.length; i < il; i++) {
                name = objectNames[i];
                test.throws(function() {
                    ns.unit('O' + i, function() {}).require(name);
                });
            }
            test.done();
        },

        'must return itself': function(test) {
            var module = ns.unit('aaa', function() {});
            var actual = module.require('bbb');
            test.strictEqual(actual, module);
            test.done();
        }

    }
};
