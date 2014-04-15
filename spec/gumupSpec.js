(function(gumup) {

    'use strict';

    describe("gumup", function() {

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

        function moduleImpl(name) {
            return function() {
                this.name = name;
            };
        }

        function objectImpl(name) {
            return function() {
                return {
                    name: name
                };
            };
        }

        function constrImpl(name) {
            return function() {
                return function() {
                    return name;
                };
            };
        }

        describe("gumup.constr", function() {

            var ns;

            beforeEach(function() {
                ns = new gumup.constructor();
            });

            it("must create a constr", function() {
                var module = ns.constr('Aaa', function() {});
                expect(typeof module.require).toBe("function");
            });

            it("must accept a valid unit name", function() {
                var i, len, name;
                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    expect(function() {
                        ns.constr(name, function() {});
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        ns.constr(name, function() {});
                    }).toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        ns.constr(name, function() {});
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    expect(function() {
                        ns.constr(name, function() {});
                    }).toThrow();
                }
            });

            it("must accept a valid unit implementation", function() {
                expect(function() {
                    ns.constr('valid', function() {});
                }).not.toThrow();
                expect(function() {
                    ns.constr('invalid.undefined');
                }).toThrow();
                expect(function() {
                    ns.constr('invalid.null');
                }).toThrow();
                expect(function() {
                    ns.constr('invalid.number', 123);
                }).toThrow();
                expect(function() {
                    ns.constr('invalid.string', "abc");
                }).toThrow();
                expect(function() {
                    ns.constr('invalid.array', []);
                }).toThrow();
                expect(function() {
                    ns.constr('invalid.object', {});
                }).toThrow();
            });

            it("must deny creating duplicates of units", function() {
                ns.constr('aaa', function() {});
                expect(function() {
                    ns.constr('aaa', function() {});
                }).toThrow();
            });

        });

        describe("gumup.init", function() {

            var ns;

            beforeEach(function() {
                ns = new gumup.constructor();
            });

            it("must create a valid object in the namespace", function() {

                ns.module('aaa', moduleImpl("AAA"));
                ns.module('bbb', moduleImpl("BBB"));
                ns.module('bbb.ccc', moduleImpl("BBB.CCC"));

                expect(ns.units.aaa).toBeUndefined();
                expect(ns.units.bbb).toBeUndefined();

                ns.init();

                expect(ns.units.aaa.name).toBe("AAA");
                expect(ns.units.bbb.name).toBe("BBB");
                expect(ns.units.bbb.ccc.name).toBe("BBB.CCC");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.object('Aaa', objectImpl("AAA"));
                ns.object('Bbb', objectImpl("BBB"));
                ns.object('ccc.Ddd', objectImpl("CCC.DDD"));
                ns.object('eee', function() {
                    return 123;
                });
                ns.init();

                expect(ns.units.Aaa.name).toBe("AAA");
                expect(ns.units.Bbb.name).toBe("BBB");
                expect(ns.units.ccc.Ddd.name).toBe("CCC.DDD");
                expect(ns.units.eee).toBe(123);

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('aaa', moduleImpl("AAA"));
                ns.object('aaa.Bbb', objectImpl("AAA.BBB"))
                    .require('aaa');
                ns.init();

                expect(ns.units.aaa.name).toBe("AAA");
                expect(ns.units.aaa.Bbb.name).toBe("AAA.BBB");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.object('Aaa', objectImpl("AAA"));
                ns.module('Aaa.bbb', moduleImpl("AAA.BBB"))
                    .require('Aaa');
                ns.init();

                expect(ns.units.Aaa.name).toBe("AAA");
                expect(ns.units.Aaa.bbb.name).toBe("AAA.BBB");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('aaa', function() {
                    this.bbb = "AAA";
                });
                ns.module('aaa.bbb', moduleImpl("AAA.BBB"))
                    .require('aaa');

                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('aaa', function() {
                    this.Bbb = "AAA";
                });
                ns.object('aaa.Bbb', objectImpl("AAA.BBB"))
                    .require('aaa');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('aaa.bbb.ccc', moduleImpl("AAA.BBB.CCC"));
                ns.module('aaa.bbb', moduleImpl("AAA.BBB"))
                    .require('aaa.bbb.ccc');
                ns.init();

                expect(ns.units.aaa.bbb.ccc.name).toBe("AAA.BBB.CCC");
                expect(ns.units.aaa.bbb.name).toBe("AAA.BBB");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('aaa.Bbb.ccc', function() {});
                ns.object('aaa.Bbb', objectImpl("AAA.BBB"))
                    .require('aaa');
                expect(function() {
                    ns.init();
                }).toThrow();
            });

            it("must inject valid dependencies", function() {
                ns.module('aaa',moduleImpl("AAA"));
                ns.module('bbb', function(units) {
                    expect(units.aaa.name).toBe("AAA");
                    this.name = "BBB";
                }).require('aaa');
                ns.object('Ccc', function(units) {
                    expect(units.aaa.name).toBe("AAA");
                    expect(units.bbb.name).toBe("BBB");
                    return {
                        name: "CCC"
                    };
                }).require('bbb');
                ns.object("Ddd", function(units) {
                    expect(units.aaa.name).toBe("AAA");
                    expect(units.bbb.name).toBe("BBB");
                    expect(units.Ccc.name).toBe("CCC");
                    return {
                        name: "DDD"
                    };
                });
                ns.module('main', function(units) {
                    expect(units.aaa.name).toBe("AAA");
                    expect(units.bbb.name).toBe("BBB");
                    expect(units.Ccc.name).toBe("CCC");
                    expect(units.Ddd.name).toBe("DDD");
                }).require('*');
                ns.init();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('bbb.ccc', moduleImpl("BBB.CCC"));
                ns.object('bbb.Ddd', objectImpl("BBB.DDD"));
                ns.module('aaa', function(units) {
                    expect(units.bbb.ccc.name).toBe("BBB.CCC");
                    expect(units.bbb.Ddd.name).toBe("BBB.DDD");
                    expect(units.bbb.name).toBeUndefined();
                    this.name = "AAA";
                }).require('bbb.*');
                ns.module('bbb', function(units) {
                    expect(units.aaa.name).toBe("AAA");
                    this.name = "BBB";
                }).require('aaa');
                ns.init();
            });

            it("must resolve dependencies", function() {
                function init(str) {
                    return function() {
                        ns.solution = (ns.solution || "") + str;
                    };
                }

                //------------------------------------------------------------
                expect(ns.solution).toBeUndefined();
                ns.module('c', init("C"))
                    .require('b');
                ns.module('a', init("A"));
                ns.module('d', init("D"))
                    .require('a')
                    .require('c')
                    .require('b');
                ns.module('b', init("B"))
                    .require('a');
                ns.init();
                expect(ns.solution).toBe("ABCD");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                expect(ns.solution).toBeUndefined();
                ns.module('c', init("C"))
                    .require('b');
                ns.module('a', init("A"));
                ns.module('d', init("D"))
                    .require('*');
                ns.module('b', init("B"))
                    .require('a');
                ns.init();
                expect(ns.solution).toBe("ABCD");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                expect(ns.solution).toBeUndefined();
                ns.module('c', init("C"))
                    .require('b');
                ns.module('b.b3._2', init("_"))
                    .require('b.b2');
                ns.module('a', init("A"));
                ns.module('b.b3._3', init("_"))
                    .require('b.b2');
                ns.module('b.b1', init("b1"))
                    .require('a');
                ns.module('d', init("D"))
                    .require('*');
                ns.module('b.b2', init("b2"))
                    .require('b.b1');
                ns.module('b', init("B"))
                    .require('b.*')
                    .require('a');
                ns.module('b.b3._1', init("_"))
                    .require('b.b2');
                ns.init();
                expect(ns.solution).toBe("Ab1b2___BCD");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('a', function() {})
                    .require('d')
                    .require('e');
                ns.module('b', function() {})
                    .require('e');
                ns.module('c', function() {})
                    .require('h')
                    .require('f');
                ns.module('d', function() {})
                    .require('g');
                ns.module('e', function() {})
                    .require('h');
                ns.module('f', function() {})
                    .require('i');
                ns.module('g', function() {})
                    .require('h')
                    .require('j');
                ns.module('h', function() {})
                    .require('k');
                ns.module('i', function() {})
                    .require('l');
                ns.module('j', function() {})
                    .require('k');
                ns.module('k', function() {});
                ns.module('l', function() {})
                    .require('b')
                    .require('k');
                expect(function() {
                    ns.init();
                }).not.toThrow();
            });

            it("must catch recursive dependencies", function() {
                ns.module('a', function() {}).require('b');
                ns.module('b', function() {}).require('a');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('a', function() {}).require('b');
                ns.module('b', function() {}).require('c');
                ns.module('c', function() {}).require('a');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('a', function() {}).require('*');
                ns.module('b', function() {}).require('*');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('a', function() {}).require('*');
                ns.module('b', function() {}).require('c');
                ns.module('c', function() {}).require('a');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('a', function() {})
                    .require('d')
                    .require('e');
                ns.module('b', function() {})
                    .require('e');
                ns.module('c', function() {})
                    .require('h')
                    .require('f');
                ns.module('d', function() {})
                    .require('g');
                ns.module('e', function() {})
                    .require('h');
                ns.module('f', function() {})
                    .require('i');
                ns.module('g', function() {})
                    .require('h')
                    .require('j');
                ns.module('h', function() {})
                    .require('i')
                    .require('k');
                ns.module('i', function() {})
                    .require('l');
                ns.module('j', function() {})
                    .require('k');
                ns.module('k', function() {});
                ns.module('l', function() {})
                    .require('b')
                    .require('k');
                expect(function() {
                    ns.init();
                }).toThrow();
            });

            it("must catch nonexistent dependencies", function() {
                ns.module('aaa', function() {}).require('bbb');
                expect(function() {
                    ns.init();
                }).toThrow();
            });

            it("must deny modifying during initialization", function() {
                var module = ns.module('aaa', function() {
                    expect(function() {
                        module.require('bbb');
                    }).toThrow();
                    expect(function() {
                        ns.module('bbb', function() {});
                    }).toThrow();
                    expect(function() {
                        ns.init();
                    }).toThrow();
                });
                ns.init();
            });

            it("must deny modifying after initialization", function() {
                var module = ns.module('aaa', function() {});
                ns.init();
                expect(function() {
                    module.require('bbb');
                }).toThrow();
                expect(function() {
                    ns.module('bbb', function() {});
                }).toThrow();
                expect(function() {
                    ns.init();
                }).toThrow();
            });

        });

        describe("gumup.module", function() {

            var ns;

            beforeEach(function() {
                ns = new gumup.constructor();
            });

            it("must create a module", function() {
                var module = ns.module('aaa', function() {});
                expect(typeof module.require).toBe("function");
            });

            it("must accept a valid unit name", function() {
                var i, len, name;
                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    expect(function() {
                        ns.module(name, function() {});
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        ns.module(name, function() {});
                    }).toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        ns.module(name, function() {});
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    expect(function() {
                        ns.module(name, function() {});
                    }).toThrow();
                }
            });

            it("must accept a valid unit implementation", function() {
                expect(function() {
                    ns.module('valid', function() {});
                }).not.toThrow();
                expect(function() {
                    ns.module('invalid.undefined');
                }).toThrow();
                expect(function() {
                    ns.module('invalid.null');
                }).toThrow();
                expect(function() {
                    ns.module('invalid.number', 123);
                }).toThrow();
                expect(function() {
                    ns.module('invalid.string', "abc");
                }).toThrow();
                expect(function() {
                    ns.module('invalid.array', []);
                }).toThrow();
                expect(function() {
                    ns.module('invalid.object', {});
                }).toThrow();
            });

            it("must deny creating duplicates of units", function() {
                ns.module('aaa', function() {});
                expect(function() {
                    ns.module('aaa', function() {});
                }).toThrow();
            });

        });

        describe("gumup.object", function() {

            var ns;

            beforeEach(function() {
                ns = new gumup.constructor();
            });

            it("must create an object", function() {
                var module = ns.object('aaa', function() {});
                expect(typeof module.require).toBe("function");
            });

            it("must accept a valid unit name", function() {
                var i, len, name;
                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    expect(function() {
                        ns.object(name, function() {});
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        ns.object(name, function() {});
                    }).toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        ns.objet(name, function() {});
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    expect(function() {
                        ns.object(name, function() {});
                    }).toThrow();
                }
            });

            it("must accept a valid unit implementation", function() {
                expect(function() {
                    ns.object('valid', function() {});
                }).not.toThrow();
                expect(function() {
                    ns.object('invalid.undefined');
                }).toThrow();
                expect(function() {
                    ns.object('invalid.null');
                }).toThrow();
                expect(function() {
                    ns.object('invalid.number', 123);
                }).toThrow();
                expect(function() {
                    ns.object('invalid.string', "abc");
                }).toThrow();
                expect(function() {
                    ns.object('invalid.array', []);
                }).toThrow();
                expect(function() {
                    ns.object('invalid.object', {});
                }).toThrow();
            });

            it("must deny creating duplicates of units", function() {
                ns.object('aaa', function() {});
                expect(function() {
                    ns.object('aaa', function() {});
                }).toThrow();
            });

        });

        describe("gumup.pick", function() {

            var ns, other;

            beforeEach(function() {
                ns = new gumup.constructor();
            });

            it("must copy unit declarations from the another namespace", function() {
                ns.module('aaa', moduleImpl("AAA"));
                ns.module('bbb', moduleImpl("BBB"));
                ns.object('bbb.Ddd', objectImpl("BBB.DDD"));
                ns.module('bbb.eee', moduleImpl("BBB.EEE"));
                ns.module('bbb.eee.fff', moduleImpl("BBB.EEE.FFF"));
                ns.object('Ccc', objectImpl("CCC"));

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    units: []
                });
                other.init();

                expect(other.units).toEqual({});

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    units: ['aaa', 'bbb']
                });
                other.init();

                expect(other.units.aaa.name).toBe("AAA");
                expect(other.units.bbb.name).toBe("BBB");
                expect(other.units.bbb.Ddd).toBeUndefined();
                expect(other.units.bbb.eee).toBeUndefined();
                expect(other.units.Ccc).toBeUndefined();

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    units: ['aaa', 'bbb.*']
                });
                other.init();

                expect(other.units.aaa.name).toBe("AAA");
                expect(other.units.bbb.name).toBeUndefined();
                expect(other.units.bbb.Ddd.name).toBe("BBB.DDD");
                expect(other.units.bbb.eee.name).toBe("BBB.EEE");
                expect(other.units.bbb.eee.fff.name).toBe("BBB.EEE.FFF");
                expect(other.units.Ccc).toBeUndefined();

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    units: ['aaa', 'Ccc']
                });
                other.init();

                expect(other.units.aaa.name).toBe("AAA");
                expect(other.units.bbb).toBeUndefined();
                expect(other.units.Ccc.name).toBe("CCC");

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    units: ['*']
                });
                other.init();

                expect(other.units.aaa.name).toBe("AAA");
                expect(other.units.bbb.name).toBe("BBB");
                expect(other.units.bbb.Ddd.name).toBe("BBB.DDD");
                expect(other.units.bbb.eee.name).toBe("BBB.EEE");
                expect(other.units.bbb.eee.fff.name).toBe("BBB.EEE.FFF");
                expect(other.units.Ccc.name).toBe("CCC");
            });

            it("must copy dependencies from the another namespace", function() {
                ns.module('aaa', moduleImpl("AAA"));
                ns.object('Bbb', objectImpl("BBB"))
                    .require('aaa');
                ns.module('ccc', moduleImpl("CCC"))
                    .require('Bbb');
                ns.object('Ddd', objectImpl("DDD"))
                    .require('ccc');
                ns.object('eee.fff', objectImpl("FFF"));
                ns.object('eee.ggg', objectImpl("GGG"));
                ns.object('hhh', objectImpl("HHH"))
                    .require('eee.fff');

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    units: ['ccc']
                });
                other.init();

                expect(other.units.aaa.name).toBe("AAA");
                expect(other.units.Bbb.name).toBe("BBB");
                expect(other.units.ccc.name).toBe("CCC");
                expect(other.units.Ddd).toBeUndefined();
                expect(other.units.eee).toBeUndefined();
                expect(other.units.hhh).toBeUndefined();

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    units: ['Ddd']
                });
                other.init();

                expect(other.units.aaa.name).toBe("AAA");
                expect(other.units.Bbb.name).toBe("BBB");
                expect(other.units.ccc.name).toBe("CCC");
                expect(other.units.Ddd.name).toBe("DDD");
                expect(other.units.eee).toBeUndefined();
                expect(other.units.hhh).toBeUndefined();

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    units: ['eee.fff']
                });
                other.init();

                expect(other.units.aaa).toBeUndefined();
                expect(other.units.Bbb).toBeUndefined();
                expect(other.units.ccc).toBeUndefined();
                expect(other.units.Ddd).toBeUndefined();
                expect(other.units.eee.fff.name).toBe("FFF");
                expect(other.units.eee.ggg).toBeUndefined();
                expect(other.units.hhh).toBeUndefined();

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    units: ['hhh']
                });
                other.init();

                expect(other.units.aaa).toBeUndefined();
                expect(other.units.Bbb).toBeUndefined();
                expect(other.units.ccc).toBeUndefined();
                expect(other.units.Ddd).toBeUndefined();
                expect(other.units.eee.fff.name).toBe("FFF");
                expect(other.units.eee.ggg).toBeUndefined();
                expect(other.units.hhh.name).toBe("HHH");
            });

            it("must inject the dependencies", function() {
                ns.module('aaa', moduleImpl("AAA"));
                ns.object('Bbb', objectImpl("BBB"));

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({});
                other.init();

                expect(other.units).toEqual({});
                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    dependencies: []
                });
                other.init();

                expect(other.units).toEqual({});
                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    dependencies: [
                        {
                            name: "test.aaa",
                            implementation: "aaa"
                        },
                        {
                            name: "test.Bbb",
                            implementation: "Bbb"
                        }
                    ]
                });
                other.init();

                expect(other.units.test.aaa.name).toBe("AAA");
                expect(other.units.test.Bbb.name).toBe("BBB");

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    dependencies: [
                        {
                            name: "ccc",
                            implementation: {
                                name: "CCC"
                            }
                        },
                        {
                            name: "ddd",
                            implementation: 123
                        }
                    ]
                });
                other.init();

                expect(other.units.ccc.name).toBe("CCC");
                expect(other.units.ddd).toBe(123);
            });

            it("must accept valid unit names", function() {
                var i, len, name;

                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    ns.module(name, function() {});
                }

                //------------------------------------------------------------
                other = new gumup.constructor();

                expect(function() {
                    other.pick({
                        units: 123
                    });
                }).toThrow();
                expect(function() {
                    other.pick({
                        units: "aaa"
                    });
                }).toThrow();
                expect(function() {
                    other.pick({
                        units: {}
                    });
                }).toThrow();
                expect(function() {
                    other.pick({
                        units: function() {}
                    });
                }).toThrow();

                //------------------------------------------------------------
                other = new gumup.constructor();

                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    expect(function() {
                        other.pick({
                            namespace: ns,
                            units: [name]
                        });
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        other.pick({
                            namespace: ns,
                            units: [name]
                        });
                    }).not.toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        other.pick({
                            namespace: ns,
                            units: [name]
                        });
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    expect(function() {
                        other.pick({
                            namespace: ns,
                            units: [name]
                        });
                    }).toThrow();
                }
            });

            it("must accept valid dependency names", function() {
                var i, len, name;

                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    ns.module(name, function() {});
                }

                //------------------------------------------------------------
                other = new gumup.constructor();

                expect(function() {
                    other.pick({
                        dependencies: 123
                    });
                }).toThrow();
                expect(function() {
                    other.pick({
                        dependencies: "aaa"
                    });
                }).toThrow();
                expect(function() {
                    other.pick({
                        dependencies: {}
                    });
                }).toThrow();
                expect(function() {
                    other.pick({
                        dependencies: function() {}
                    });
                }).toThrow();

                //------------------------------------------------------------
                other = new gumup.constructor();

                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    expect(function() {
                        other.pick({
                            dependencies: [
                                {
                                    name: name,
                                    implementation: {}
                                }
                            ]
                        });
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        other.pick({
                            dependencies: [
                                {
                                    name: name,
                                    implementation: {}
                                }
                            ]
                        });
                    }).toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        other.pick({
                            dependencies: [
                                {
                                    name: name,
                                    implementation: {}
                                }
                            ]
                        });
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    expect(function() {
                        other.pick({
                            dependencies: [
                                {
                                    name: name,
                                    implementation: {}
                                }
                            ]
                        });
                    }).toThrow();
                }

                //------------------------------------------------------------
                other = new gumup.constructor();

                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    expect(function() {
                        other.pick({
                            namespace: ns,
                            dependencies: [
                                {
                                    name: "V" + i,
                                    implementation: name
                                }
                            ]
                        });
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        other.pick({
                            namespace: ns,
                            dependencies: [
                                {
                                    name: "R" + i,
                                    implementation: name
                                }
                            ]
                        });
                    }).toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        other.pick({
                            namespace: ns,
                            dependencies: [
                                {
                                    name: "I" + i,
                                    implementation: name
                                }
                            ]
                        });
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    expect(function() {
                        other.pick({
                            namespace: ns,
                            dependencies: [
                                {
                                    name: "I" + i,
                                    implementation: name
                                }
                            ]
                        });
                    }).not.toThrow();
                }
            });

            it("must catch nonexistent units", function() {
                ns.module('aaa', function() {});

                //------------------------------------------------------------
                other = new gumup.constructor();

                expect(function() {
                    other.pick({
                        namespace: ns,
                        units: ['aaa', 'bbb']
                    });
                }).toThrow();

                //------------------------------------------------------------
                other = new gumup.constructor();

                ns.module('bbb', function() {});
                expect(function() {
                    other.pick({
                        namespace: ns,
                        units: ['aaa', 'bbb']
                    });
                }).not.toThrow();

                //------------------------------------------------------------
                other = new gumup.constructor();

                expect(function() {
                    other.pick({
                        namespace: ns,
                        dependencies: [
                            {
                                name: 'test.ccc',
                                implementation: 'ccc'
                            }
                        ]
                    });
                }).toThrow();
            });

            it("must return itself", function() {
                ns.module('aaa', function() {});
                other = new gumup.constructor();
                var actual = other.pick({
                    namespace: ns,
                    units: ['aaa']
                });
                expect(actual).toBe(other);
            });

        });

        describe("Declaration.require", function() {

            var ns;

            beforeEach(function() {
                ns = new gumup.constructor();
            });

            it("must accept a valid required unit name", function() {
                var i, len, name;
                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    expect(function() {
                        ns.module("V" + i, function() {}).require(name);
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        ns.module("R" + i, function() {}).require(name);
                    }).not.toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        ns.module("I" + i, function() {}).require(name);
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    expect(function() {
                        ns.module("O" + i, function() {}).require(name);
                    }).toThrow();
                }
            });

            it("must return itself", function() {
                var module = ns.module('aaa', function() {});
                var actual = module.require('bbb');
                expect(actual).toBe(module);
            });

        });

    });

})(gumup);
