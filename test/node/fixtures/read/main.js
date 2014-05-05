(function(ns) {

    var unit = ns.unit('main', function() {});

    unit.require('util.foo');
    unit.require('*');

})(gumup);
