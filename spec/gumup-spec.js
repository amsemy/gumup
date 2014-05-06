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

        function defaultImpl(value) {
            return function() {
                this.value = value;
            };
        }

        function customImpl(value) {
            return function() {
                return {
                    value: value
                };
            };
        }

        describe("gumup.init", function() {

            var ns;

            beforeEach(function() {
                ns = new gumup.constructor();
            });

            it("must create a valid unit in the namespace", function() {
                ns.unit('aaa', defaultImpl("AAA"));
                ns.unit('bbb', customImpl("BBB"));
                ns.unit('ccc.ddd', defaultImpl("BBB.CCC"));
                ns.unit('eee', function() {
                    return "anything";
                });
                ns.init();

                expect(ns.units.aaa.value).toBe("AAA");
                expect(ns.units.bbb.value).toBe("BBB");
                expect(ns.units.ccc.ddd.value).toBe("BBB.CCC");
                expect(ns.units.eee).toBe("anything");
            });

            it("must allow to create the unit over an existing objects in the namespace", function() {
                ns.unit('aaa', defaultImpl("AAA"));
                ns.unit('aaa.bbb', defaultImpl("AAA.BBB"))
                    .require('aaa');
                ns.init();

                expect(ns.units.aaa.value).toBe("AAA");
                expect(ns.units.aaa.bbb.value).toBe("AAA.BBB");

                //--------------------------------------------------------
                ns = new gumup.constructor();

                ns.unit('aaa', function() {
                    return "anything";
                });
                ns.unit('aaa.bbb', defaultImpl("AAA.BBB"))
                    .require('aaa');

                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.unit('aaa.bbb.ccc', defaultImpl("AAA.BBB.CCC"));
                ns.unit('aaa.bbb', defaultImpl("AAA.BBB"))
                    .require('aaa.bbb.ccc');
                ns.init();

                expect(ns.units.aaa.bbb.ccc.value).toBe("AAA.BBB.CCC");
                expect(ns.units.aaa.bbb.value).toBe("AAA.BBB");
            });

            it("must resolve dependencies", function() {
                function init(str) {
                    return function() {
                        ns.solution = (ns.solution || "") + str;
                    };
                }

                //------------------------------------------------------------
                expect(ns.solution).toBeUndefined();
                ns.unit('c', init("C"))
                    .require('b');
                ns.unit('a', init("A"));
                ns.unit('d', init("D"))
                    .require('a')
                    .require('c')
                    .require('b');
                ns.unit('b', init("B"))
                    .require('a');
                ns.init();
                expect(ns.solution).toBe("ABCD");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                expect(ns.solution).toBeUndefined();
                ns.unit('c', init("C"))
                    .require('b');
                ns.unit('a', init("A"));
                ns.unit('d', init("D"))
                    .require('*');
                ns.unit('b', init("B"))
                    .require('a');
                ns.init();
                expect(ns.solution).toBe("ABCD");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                expect(ns.solution).toBeUndefined();
                ns.unit('b', init("B"))
                    .require('c');
                ns.unit('d', init("D"));
                ns.unit('a', init("A"))
                    .require('d')
                    .require('b')
                    .require('c');
                ns.unit('c', init("C"))
                    .require('d');
                ns.init();
                expect(ns.solution).toBe("DCBA");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                expect(ns.solution).toBeUndefined();
                ns.unit('b', init("B"))
                    .require('c');
                ns.unit('d', init("D"));
                ns.unit('a', init("A"))
                    .require('*');
                ns.unit('c', init("C"))
                    .require('d');
                ns.init();
                expect(ns.solution).toBe("DCBA");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                expect(ns.solution).toBeUndefined();
                ns.unit('c', init("C"))
                    .require('b');
                ns.unit('b.b3._2', init("_"))
                    .require('b.b2');
                ns.unit('a', init("A"));
                ns.unit('b.b3._3', init("_"))
                    .require('b.b2');
                ns.unit('b.b1', init("b1"))
                    .require('a');
                ns.unit('d', init("D"))
                    .require('*');
                ns.unit('b.b2', init("b2"))
                    .require('b.b1');
                ns.unit('b', init("B"))
                    .require('b.*')
                    .require('a');
                ns.unit('b.b3._1', init("_"))
                    .require('b.b2');
                ns.init();
                expect(ns.solution).toBe("Ab1b2___BCD");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.unit('a', init("A"))
                    .require('d')
                    .require('e');
                ns.unit('b', init("B"))
                    .require('e');
                ns.unit('c', init("C"))
                    .require('h')
                    .require('f');
                ns.unit('d', init("D"))
                    .require('g');
                ns.unit('e', init("E"))
                    .require('h');
                ns.unit('f', init("F"))
                    .require('i');
                ns.unit('g', init("G"))
                    .require('h')
                    .require('j');
                ns.unit('h', init("H"))
                    .require('k');
                ns.unit('i', init("I"))
                    .require('l');
                ns.unit('j', init("J"))
                    .require('k');
                ns.unit('k', init("K"));
                ns.unit('l', init("L"))
                    .require('b')
                    .require('k');
                ns.init();
                expect(ns.solution).toBe("KHJGDEABLIFC");
            });

            it("must inject resolved dependencies", function() {
                ns.unit('aaa', defaultImpl("AAA"));
                ns.unit('bbb', function(units) {
                    expect(units.aaa.value).toBe("AAA");
                    this.value = "BBB";
                }).require('aaa');
                ns.unit('ccc', function(units) {
                    expect(units.aaa.value).toBe("AAA");
                    expect(units.bbb.value).toBe("BBB");
                    this.value = "CCC";
                }).require('bbb');
                ns.unit("ddd", function(units) {
                    expect(units.aaa.value).toBe("AAA");
                    expect(units.bbb.value).toBe("BBB");
                    expect(units.ccc.value).toBe("CCC");
                    this.value = "DDD";
                });
                ns.unit('main', function(units) {
                    expect(units.aaa.value).toBe("AAA");
                    expect(units.bbb.value).toBe("BBB");
                    expect(units.ccc.value).toBe("CCC");
                    expect(units.ddd.value).toBe("DDD");
                }).require('*');
                ns.init();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.unit('bbb.ccc', defaultImpl("BBB.CCC"));
                ns.unit('bbb.ddd', defaultImpl("BBB.DDD"));
                ns.unit('aaa', function(units) {
                    expect(units.bbb.ccc.value).toBe("BBB.CCC");
                    expect(units.bbb.ddd.value).toBe("BBB.DDD");
                    expect(units.bbb.value).toBeUndefined();
                    this.value = "AAA";
                }).require('bbb.*');
                ns.unit('bbb', function(units) {
                    expect(units.aaa.value).toBe("AAA");
                    this.value = "BBB";
                }).require('aaa');
                ns.init();
            });

            it("must catch recursive dependencies", function() {
                ns.unit('a', function() {}).require('b');
                ns.unit('b', function() {}).require('a');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.unit('a', function() {}).require('b');
                ns.unit('b', function() {}).require('c');
                ns.unit('c', function() {}).require('a');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.unit('a', function() {}).require('*');
                ns.unit('b', function() {}).require('*');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.unit('a', function() {}).require('*');
                ns.unit('b', function() {}).require('c');
                ns.unit('c', function() {}).require('a');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.unit('a', function() {})
                    .require('d')
                    .require('e');
                ns.unit('b', function() {})
                    .require('e');
                ns.unit('c', function() {})
                    .require('h')
                    .require('f');
                ns.unit('d', function() {})
                    .require('g');
                ns.unit('e', function() {})
                    .require('h');
                ns.unit('f', function() {})
                    .require('i');
                ns.unit('g', function() {})
                    .require('h')
                    .require('j');
                ns.unit('h', function() {})
                    .require('i')
                    .require('k');
                ns.unit('i', function() {})
                    .require('l');
                ns.unit('j', function() {})
                    .require('k');
                ns.unit('k', function() {});
                ns.unit('l', function() {})
                    .require('b')
                    .require('k');
                expect(function() {
                    ns.init();
                }).toThrow();
            });

            it("must catch nonexistent dependencies", function() {
                ns.unit('aaa', function() {}).require('bbb');
                expect(function() {
                    ns.init();
                }).toThrow();
            });

            it("must deny modifying during initialization", function() {
                var module = ns.unit('aaa', function() {
                    expect(function() {
                        module.require('bbb');
                    }).toThrow();
                    expect(function() {
                        ns.unit('bbb', function() {});
                    }).toThrow();
                    expect(function() {
                        ns.init();
                    }).toThrow();
                });
                ns.init();
            });

            it("must deny modifying after initialization", function() {
                var module = ns.unit('aaa', function() {});
                ns.init();
                expect(function() {
                    module.require('bbb');
                }).toThrow();
                expect(function() {
                    ns.unit('bbb', function() {});
                }).toThrow();
                expect(function() {
                    ns.init();
                }).toThrow();
            });

        });

        describe("gumup.inject", function() {

            var ns, other;

            beforeEach(function() {
                ns = new gumup.constructor();
                other = new gumup.constructor();
            });

            it("must do the injections", function() {
                other.unit('aaa', defaultImpl("AAA"));
                other.unit('bbb', customImpl("BBB"));
                other.unit("ccc", customImpl("CCC"));

                //------------------------------------------------------------
                ns.inject({
                    injections: []
                });
                ns.init();

                expect(ns.units).toEqual({});

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.inject({
                    namespace: other,
                    injections: [
                        {
                            name: "test.aaa",
                            unit: "aaa"
                        },
                        {
                            name: "test.bbb",
                            unit: "bbb"
                        },
                        {
                            name: "test.ccc",
                            unit: "ccc"
                        }
                    ]
                });
                ns.init();

                expect(ns.units.test.aaa.value).toBe("AAA");
                expect(ns.units.test.bbb.value).toBe("BBB");
                expect(ns.units.test.ccc.value).toBe("CCC");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.inject({
                    injections: [
                        {
                            name: "ddd",
                            value: {
                                value: "DDD"
                            }
                        },
                        {
                            name: "eee",
                            value: 123
                        }
                    ]
                });
                ns.init();

                expect(ns.units.ddd.value).toBe("DDD");
                expect(ns.units.eee).toBe(123);
            });

            it("must check the injection settings", function() {
                expect(function () {
                    ns.inject({});
                }).toThrow();
                expect(function () {
                    ns.inject({
                        namespace: other
                    });
                }).toThrow();
            });

            it("must check the injecton list in the settings", function() {
                expect(function () {
                    ns.inject({
                        injections: 123
                    });
                }).toThrow();
                expect(function () {
                    ns.inject({
                        injections: "aaa"
                    });
                }).toThrow();
                expect(function () {
                    ns.inject({
                        injections: {}
                    });
                }).toThrow();
                expect(function () {
                    ns.inject({
                        injections: function () {
                        }
                    });
                }).toThrow();
            });

            it("must check the object in the settings", function() {
                other.unit('aaa', function() {});

                expect(function () {
                    ns.inject({
                        namespace: other,
                        injections: [
                            {
                                name: 'test.aaa'
                            }
                        ]
                    });
                }).toThrow();
                expect(function () {
                    ns.inject({
                        namespace: other,
                        injections: [
                            {
                                name: 'test.aaa',
                                unit: 'aaa',
                                value: {}
                            }
                        ]
                    });
                }).toThrow();
            });

            it("must accept valid unit names", function() {
                var i, len, name;

                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    other.unit(name, function() {});
                }

                //------------------------------------------------------------
                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    expect(function() {
                        ns.inject({
                            injections: [
                                {
                                    name: name,
                                    value: {}
                                }
                            ]
                        });
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        ns.inject({
                            injections: [
                                {
                                    name: name,
                                    value: {}
                                }
                            ]
                        });
                    }).toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        ns.inject({
                            injections: [
                                {
                                    name: name,
                                    value: {}
                                }
                            ]
                        });
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    expect(function() {
                        ns.inject({
                            injections: [
                                {
                                    name: name,
                                    value: {}
                                }
                            ]
                        });
                    }).toThrow();
                }

                //------------------------------------------------------------
                ns = new gumup.constructor();

                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    expect(function() {
                        ns.inject({
                            namespace: other,
                            injections: [
                                {
                                    name: "V" + i,
                                    unit: name
                                }
                            ]
                        });
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        ns.inject({
                            namespace: other,
                            injections: [
                                {
                                    name: "R" + i,
                                    unit: name
                                }
                            ]
                        });
                    }).toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        ns.inject({
                            namespace: other,
                            injections: [
                                {
                                    name: "I" + i,
                                    unit: name
                                }
                            ]
                        });
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    if (name == null) {
                        continue;
                    }
                    expect(function() {
                        ns.inject({
                            namespace: other,
                            injections: [
                                {
                                    name: "I" + i,
                                    unit: name
                                }
                            ]
                        });
                    }).toThrow();
                }
            });

            it("must catch nonexistent units", function() {
                expect(function() {
                    ns.inject({
                        namespace: ns,
                        injections: [
                            {
                                name: 'test.aaa',
                                unit: 'aaa'
                            }
                        ]
                    });
                }).toThrow();
            });

            it("must return itself", function() {
                var actual = ns.inject({
                    injections: []
                });
                expect(actual).toBe(ns);
            });

        });

        describe("gumup.pick", function() {

            var ns, other;

            beforeEach(function() {
                ns = new gumup.constructor();
                other = new gumup.constructor();
            });

            it("must copy unit declarations from the another namespace", function() {
                other.unit('aaa', defaultImpl("AAA"));
                other.unit('bbb', defaultImpl("BBB"));
                other.unit('bbb.ddd', defaultImpl("BBB.DDD"));
                other.unit('bbb.eee', defaultImpl("BBB.EEE"));
                other.unit('bbb.eee.fff', defaultImpl("BBB.EEE.FFF"));
                other.unit('ccc', defaultImpl("CCC"));

                //------------------------------------------------------------
                ns.pick({
                    namespace: other,
                    units: []
                });
                ns.init();

                expect(ns.units).toEqual({});

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.pick({
                    namespace: other,
                    units: ['aaa', 'bbb']
                });
                ns.init();

                expect(ns.units.aaa.value).toBe("AAA");
                expect(ns.units.bbb.value).toBe("BBB");
                expect(ns.units.bbb.ddd).toBeUndefined();
                expect(ns.units.bbb.eee).toBeUndefined();
                expect(ns.units.ccc).toBeUndefined();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.pick({
                    namespace: other,
                    units: ['aaa', 'bbb.*']
                });
                ns.init();

                expect(ns.units.aaa.value).toBe("AAA");
                expect(ns.units.bbb.value).toBeUndefined();
                expect(ns.units.bbb.ddd.value).toBe("BBB.DDD");
                expect(ns.units.bbb.eee.value).toBe("BBB.EEE");
                expect(ns.units.bbb.eee.fff.value).toBe("BBB.EEE.FFF");
                expect(ns.units.ccc).toBeUndefined();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.pick({
                    namespace: other,
                    units: ['aaa', 'ccc']
                });
                ns.init();

                expect(ns.units.aaa.value).toBe("AAA");
                expect(ns.units.bbb).toBeUndefined();
                expect(ns.units.ccc.value).toBe("CCC");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.pick({
                    namespace: other,
                    units: ['*']
                });
                ns.init();

                expect(ns.units.aaa.value).toBe("AAA");
                expect(ns.units.bbb.value).toBe("BBB");
                expect(ns.units.bbb.ddd.value).toBe("BBB.DDD");
                expect(ns.units.bbb.eee.value).toBe("BBB.EEE");
                expect(ns.units.bbb.eee.fff.value).toBe("BBB.EEE.FFF");
                expect(ns.units.ccc.value).toBe("CCC");
            });

            it("must copy dependencies from the another namespace", function() {
                other.unit('aaa', defaultImpl("AAA"));
                other.unit('bbb', defaultImpl("BBB"))
                    .require('aaa');
                other.unit('ccc', defaultImpl("CCC"))
                    .require('bbb');
                other.unit('ddd', defaultImpl("DDD"))
                    .require('ccc');
                other.unit('eee.fff', defaultImpl("FFF"));
                other.unit('eee.ggg', defaultImpl("GGG"));
                other.unit('hhh', defaultImpl("HHH"))
                    .require('*');
                other.unit('iii', defaultImpl("III"))
                    .require('eee.*');
                other.unit('jjj', defaultImpl("JJJ"))
                    .require('eee.fff');

                //------------------------------------------------------------
                ns.pick({
                    namespace: other,
                    units: ['ccc']
                });
                ns.init();

                expect(ns.units.aaa.value).toBe("AAA");
                expect(ns.units.bbb.value).toBe("BBB");
                expect(ns.units.ccc.value).toBe("CCC");
                expect(ns.units.ddd).toBeUndefined();
                expect(ns.units.eee).toBeUndefined();
                expect(ns.units.hhh).toBeUndefined();
                expect(ns.units.iii).toBeUndefined();
                expect(ns.units.jjj).toBeUndefined();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.pick({
                    namespace: other,
                    units: ['ddd']
                });
                ns.init();

                expect(ns.units.aaa.value).toBe("AAA");
                expect(ns.units.bbb.value).toBe("BBB");
                expect(ns.units.ccc.value).toBe("CCC");
                expect(ns.units.ddd.value).toBe("DDD");
                expect(ns.units.eee).toBeUndefined();
                expect(ns.units.hhh).toBeUndefined();
                expect(ns.units.iii).toBeUndefined();
                expect(ns.units.jjj).toBeUndefined();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.pick({
                    namespace: other,
                    units: ['hhh']
                });
                ns.init();

                expect(ns.units.aaa.value).toBe("AAA");
                expect(ns.units.bbb.value).toBe("BBB");
                expect(ns.units.ccc.value).toBe("CCC");
                expect(ns.units.ddd.value).toBe("DDD");
                expect(ns.units.eee.fff.value).toBe("FFF");
                expect(ns.units.eee.ggg.value).toBe("GGG");
                expect(ns.units.hhh.value).toBe("HHH");
                expect(ns.units.iii.value).toBe("III");
                expect(ns.units.jjj.value).toBe("JJJ");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.pick({
                    namespace: other,
                    units: ['iii']
                });
                ns.init();

                expect(ns.units.aaa).toBeUndefined();
                expect(ns.units.bbb).toBeUndefined();
                expect(ns.units.ccc).toBeUndefined();
                expect(ns.units.ddd).toBeUndefined();
                expect(ns.units.eee.fff.value).toBe("FFF");
                expect(ns.units.eee.ggg.value).toBe("GGG");
                expect(ns.units.hhh).toBeUndefined();
                expect(ns.units.iii.value).toBe("III");
                expect(ns.units.jjj).toBeUndefined();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.pick({
                    namespace: other,
                    units: ['jjj']
                });
                ns.init();

                expect(ns.units.aaa).toBeUndefined();
                expect(ns.units.bbb).toBeUndefined();
                expect(ns.units.ccc).toBeUndefined();
                expect(ns.units.ddd).toBeUndefined();
                expect(ns.units.eee.fff.value).toBe("FFF");
                expect(ns.units.eee.ggg).toBeUndefined();
                expect(ns.units.hhh).toBeUndefined();
                expect(ns.units.iii).toBeUndefined();
                expect(ns.units.jjj.value).toBe("JJJ");
            });

            it("must check the pick settings", function() {
                expect(function () {
                    ns.pick({});
                }).toThrow();
                expect(function () {
                    ns.pick({
                        namespace: other
                    });
                }).toThrow();
                expect(function () {
                    ns.pick({
                        units: []
                    });
                }).toThrow();
            });

            it("must accept valid unit names", function() {
                var i, len, name;

                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    other.unit(name, function() {});
                }

                //------------------------------------------------------------
                expect(function() {
                    ns.pick({
                        units: 123
                    });
                }).toThrow();
                expect(function() {
                    ns.pick({
                        units: "aaa"
                    });
                }).toThrow();
                expect(function() {
                    ns.pick({
                        units: {}
                    });
                }).toThrow();
                expect(function() {
                    ns.pick({
                        units: function() {}
                    });
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    expect(function() {
                        ns.pick({
                            namespace: other,
                            units: [name]
                        });
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        ns.pick({
                            namespace: other,
                            units: [name]
                        });
                    }).not.toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        ns.pick({
                            namespace: other,
                            units: [name]
                        });
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    expect(function() {
                        ns.pick({
                            namespace: other,
                            units: [name]
                        });
                    }).toThrow();
                }
            });

            it("must catch recursive dependencies", function() {
                other.unit('a', function() {}).require('b');
                other.unit('b', function() {}).require('a');
                expect(function() {
                    ns.pick({
                        namespace: other,
                        units: ['a']
                    });
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();
                other = new gumup.constructor();

                other.unit('a', function() {}).require('b');
                other.unit('b', function() {}).require('c');
                other.unit('c', function() {}).require('a');
                expect(function() {
                    ns.pick({
                        namespace: other,
                        units: ['a']
                    });
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();
                other = new gumup.constructor();

                other.unit('a', function() {}).require('*');
                other.unit('b', function() {}).require('*');
                expect(function() {
                    ns.pick({
                        namespace: other,
                        units: ['a']
                    });
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();
                other = new gumup.constructor();

                other.unit('a', function() {}).require('*');
                other.unit('b', function() {}).require('c');
                other.unit('c', function() {}).require('a');
                expect(function() {
                    ns.pick({
                        namespace: other,
                        units: ['a']
                    });
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();
                other = new gumup.constructor();

                other.unit('a', function() {})
                    .require('d')
                    .require('e');
                other.unit('b', function() {})
                    .require('e');
                other.unit('c', function() {})
                    .require('h')
                    .require('f');
                other.unit('d', function() {})
                    .require('g');
                other.unit('e', function() {})
                    .require('h');
                other.unit('f', function() {})
                    .require('i');
                other.unit('g', function() {})
                    .require('h')
                    .require('j');
                other.unit('h', function() {})
                    .require('i')
                    .require('k');
                other.unit('i', function() {})
                    .require('l');
                other.unit('j', function() {})
                    .require('k');
                other.unit('k', function() {});
                other.unit('l', function() {})
                    .require('b')
                    .require('k');
                expect(function() {
                    ns.pick({
                        namespace: other,
                        units: ['a']
                    });
                }).toThrow();
            });

            it("must catch nonexistent units", function() {
                other.unit('aaa', function() {});

                //------------------------------------------------------------
                expect(function() {
                    ns.pick({
                        namespace: other,
                        units: ['aaa', 'bbb']
                    });
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                other.unit('bbb', function() {});
                expect(function() {
                    ns.pick({
                        namespace: other,
                        units: ['aaa', 'bbb']
                    });
                }).not.toThrow();
            });

            it("must return itself", function() {
                var actual = ns.pick({
                    namespace: other,
                    units: []
                });
                expect(actual).toBe(ns);
            });

        });

        describe("gumup.unit", function() {

            var ns;

            beforeEach(function() {
                ns = new gumup.constructor();
            });

            it("must create a unit", function() {
                var module = ns.unit('aaa', function() {});
                expect(typeof module.require).toBe("function");
            });

            it("must accept a valid unit name", function() {
                var i, len, name;
                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    expect(function() {
                        ns.unit(name, function() {});
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        ns.unit(name, function() {});
                    }).toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        ns.unit(name, function() {});
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    expect(function() {
                        ns.unit(name, function() {});
                    }).toThrow();
                }
            });

            it("must accept a valid unit implementation", function() {
                expect(function() {
                    ns.unit('valid', function() {});
                }).not.toThrow();
                expect(function() {
                    ns.unit('invalid.undefined');
                }).toThrow();
                expect(function() {
                    ns.unit('invalid.null');
                }).toThrow();
                expect(function() {
                    ns.unit('invalid.number', 123);
                }).toThrow();
                expect(function() {
                    ns.unit('invalid.string', "abc");
                }).toThrow();
                expect(function() {
                    ns.unit('invalid.array', []);
                }).toThrow();
                expect(function() {
                    ns.unit('invalid.object', {});
                }).toThrow();
            });

            it("must deny creating duplicates of units", function() {
                ns.unit('aaa', function() {});
                expect(function() {
                    ns.unit('aaa', function() {});
                }).toThrow();
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
                        ns.unit("V" + i, function() {}).require(name);
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        ns.unit("R" + i, function() {}).require(name);
                    }).not.toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        ns.unit("I" + i, function() {}).require(name);
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    expect(function() {
                        ns.unit("O" + i, function() {}).require(name);
                    }).toThrow();
                }
            });

            it("must return itself", function() {
                var module = ns.unit('aaa', function() {});
                var actual = module.require('bbb');
                expect(actual).toBe(module);
            });

        });

    });

})(gumup);
