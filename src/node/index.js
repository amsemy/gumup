/*
 * gumup
 * https://github.com/amsemy/gumup
 *
 * Copyright (c) 2014 Amsemy
 * Licensed under the MIT license.
 */

'use strict';

var unitCache = require('./unit-cache');
var gumupNamespace = require('./gumup-namespace');

module.exports = function(options) {

    //  options: {
    //      globals: [
    //          {
    //              name: 'foo'
    //              files: 'third-party/foo-1.0.js',
    //              dependent: [
    //                  'src/lib/foo.js',
    //                  'src/main.js'
    //              ]
    //          },
    //          {
    //              name: 'bar'
    //              files: [
    //                  'third-party/bar-1.0.js'
    //                  'third-party/bar.plugin-1.0.js'
    //              ],
    //              dependent: 'src/lib/bar.js'
    //          }
    //      ],
    //      gumupSpy: function(Gumup) {
    //          Gumup.prototype.constr = Gumup.prototype.unit;
    //          Gumup.prototype.object = Gumup.prototype.unit;
    //      },
    //      unitPath: ['src']
    //  }

    var unitCache = unitCache();

    return {
        create: function() {

        }
    };

};
