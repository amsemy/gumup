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

        function moduleName(name) {
            return function() {
                this.name = name;
            };
        }

        function objectName(name) {
            return function() {
                return {
                    name: name
                };
            };
        }

        describe("gumup.pick", function() {

            var ns, other;

            beforeEach(function() {
                ns = new gumup.constructor();
            });

            it("must copy module declarations from the another namespace", function() {
                ns.module('aaa', moduleName("AAA"));
                ns.module('bbb', moduleName("BBB"));
                ns.object('bbb.Ddd', objectName("BBB.DDD"));
                ns.module('bbb.eee', moduleName("BBB.EEE"));
                ns.module('bbb.eee.fff', moduleName("BBB.EEE.FFF"));
                ns.object('Ccc', objectName("CCC"));

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    modules: []
                });
                other.init();

                expect(other.modules).toEqual({});

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    modules: ['aaa', 'bbb']
                });
                other.init();

                expect(other.modules.aaa.name).toBe("AAA");
                expect(other.modules.bbb.name).toBe("BBB");
                expect(other.modules.bbb.Ddd).toBeUndefined();
                expect(other.modules.bbb.eee).toBeUndefined();
                expect(other.modules.Ccc).toBeUndefined();

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    modules: ['aaa', 'bbb.*']
                });
                other.init();

                expect(other.modules.aaa.name).toBe("AAA");
                expect(other.modules.bbb.name).toBeUndefined();
                expect(other.modules.bbb.Ddd.name).toBe("BBB.DDD");
                expect(other.modules.bbb.eee.name).toBe("BBB.EEE");
                expect(other.modules.bbb.eee.fff.name).toBe("BBB.EEE.FFF");
                expect(other.modules.Ccc).toBeUndefined();

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    modules: ['aaa', 'Ccc']
                });
                other.init();

                expect(other.modules.aaa.name).toBe("AAA");
                expect(other.modules.bbb).toBeUndefined();
                expect(other.modules.Ccc.name).toBe("CCC");

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    modules: ['*']
                });
                other.init();

                expect(other.modules.aaa.name).toBe("AAA");
                expect(other.modules.bbb.name).toBe("BBB");
                expect(other.modules.bbb.Ddd.name).toBe("BBB.DDD");
                expect(other.modules.bbb.eee.name).toBe("BBB.EEE");
                expect(other.modules.bbb.eee.fff.name).toBe("BBB.EEE.FFF");
                expect(other.modules.Ccc.name).toBe("CCC");
            });

            it("must copy dependencies from the another namespace", function() {
                ns.module('aaa', moduleName("AAA"));
                ns.object('Bbb', objectName("BBB"))
                    .require('aaa');
                ns.module('ccc', moduleName("CCC"))
                    .require('Bbb');
                ns.object('Ddd', objectName("DDD"))
                    .require('ccc');
                ns.object('eee.fff', objectName("FFF"));
                ns.object('eee.ggg', objectName("GGG"));
                ns.object('hhh', objectName("HHH"))
                    .require('eee.fff');

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    modules: ['ccc']
                });
                other.init();

                expect(other.modules.aaa.name).toBe("AAA");
                expect(other.modules.Bbb.name).toBe("BBB");
                expect(other.modules.ccc.name).toBe("CCC");
                expect(other.modules.Ddd).toBeUndefined();
                expect(other.modules.eee).toBeUndefined();
                expect(other.modules.hhh).toBeUndefined();

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    modules: ['Ddd']
                });
                other.init();

                expect(other.modules.aaa.name).toBe("AAA");
                expect(other.modules.Bbb.name).toBe("BBB");
                expect(other.modules.ccc.name).toBe("CCC");
                expect(other.modules.Ddd.name).toBe("DDD");
                expect(other.modules.eee).toBeUndefined();
                expect(other.modules.hhh).toBeUndefined();

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    modules: ['eee.fff']
                });
                other.init();

                expect(other.modules.aaa).toBeUndefined();
                expect(other.modules.Bbb).toBeUndefined();
                expect(other.modules.ccc).toBeUndefined();
                expect(other.modules.Ddd).toBeUndefined();
                expect(other.modules.eee.fff.name).toBe("FFF");
                expect(other.modules.eee.ggg).toBeUndefined();
                expect(other.modules.hhh).toBeUndefined();

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    namespace: ns,
                    modules: ['hhh']
                });
                other.init();

                expect(other.modules.aaa).toBeUndefined();
                expect(other.modules.Bbb).toBeUndefined();
                expect(other.modules.ccc).toBeUndefined();
                expect(other.modules.Ddd).toBeUndefined();
                expect(other.modules.eee.fff.name).toBe("FFF");
                expect(other.modules.eee.ggg).toBeUndefined();
                expect(other.modules.hhh.name).toBe("HHH");
            });

            it("must inject the dependencies", function() {
                ns.module('aaa', moduleName("AAA"));
                ns.object('Bbb', objectName("BBB"));

                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({});
                other.init();

                expect(other.modules).toEqual({});
                //------------------------------------------------------------
                other = new gumup.constructor();

                other.pick({
                    dependencies: []
                });
                other.init();

                expect(other.modules).toEqual({});
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

                expect(other.modules.test.aaa.name).toBe("AAA");
                expect(other.modules.test.Bbb.name).toBe("BBB");

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

                expect(other.modules.ccc.name).toBe("CCC");
                expect(other.modules.ddd).toBe(123);
            });

            it("must accept valid module names", function() {
                var i, len, name;

                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    ns.module(name, function() {});
                }

                //------------------------------------------------------------
                other = new gumup.constructor();

                expect(function() {
                    other.pick({
                        modules: 123
                    });
                }).toThrow();
                expect(function() {
                    other.pick({
                        modules: "aaa"
                    });
                }).toThrow();
                expect(function() {
                    other.pick({
                        modules: {}
                    });
                }).toThrow();
                expect(function() {
                    other.pick({
                        modules: function() {}
                    });
                }).toThrow();

                //------------------------------------------------------------
                other = new gumup.constructor();

                for (i = 0, len = validNames.length; i < len; i++) {
                    name = validNames[i];
                    expect(function() {
                        other.pick({
                            namespace: ns,
                            modules: [name]
                        });
                    }).not.toThrow();
                }
                for (i = 0, len = requiredNames.length; i < len; i++) {
                    name = requiredNames[i];
                    expect(function() {
                        other.pick({
                            namespace: ns,
                            modules: [name]
                        });
                    }).not.toThrow();
                }
                for (i = 0, len = invalidNames.length; i < len; i++) {
                    name = invalidNames[i];
                    expect(function() {
                        other.pick({
                            namespace: ns,
                            modules: [name]
                        });
                    }).toThrow();
                }
                for (i = 0, len = objectNames.length; i < len; i++) {
                    name = objectNames[i];
                    expect(function() {
                        other.pick({
                            namespace: ns,
                            modules: [name]
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

            it("must catch nonexistent modules", function() {
                ns.module('aaa', function() {});

                //------------------------------------------------------------
                other = new gumup.constructor();

                expect(function() {
                    other.pick({
                        namespace: ns,
                        modules: ['aaa', 'bbb']
                    });
                }).toThrow();

                //------------------------------------------------------------
                other = new gumup.constructor();

                ns.module('bbb', function() {});
                expect(function() {
                    other.pick({
                        namespace: ns,
                        modules: ['aaa', 'bbb']
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
                    modules: ['aaa']
                });
                expect(actual).toBe(other);
            });

        });

        describe("gumup.init", function() {

            var ns;

            beforeEach(function() {
                ns = new gumup.constructor();
            });

            it("must create a valid object in the namespace", function() {

                ns.module('aaa', moduleName("AAA"));
                ns.module('bbb', moduleName("BBB"));
                ns.module('bbb.ccc', moduleName("BBB.CCC"));

                expect(ns.modules.aaa).toBeUndefined();
                expect(ns.modules.bbb).toBeUndefined();

                ns.init();

                expect(ns.modules.aaa.name).toBe("AAA");
                expect(ns.modules.bbb.name).toBe("BBB");
                expect(ns.modules.bbb.ccc.name).toBe("BBB.CCC");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.object('Aaa', objectName("AAA"));
                ns.object('Bbb', objectName("BBB"));
                ns.object('ccc.Ddd', objectName("CCC.DDD"));
                ns.object('eee', function() {
                    return 123;
                });
                ns.init();

                expect(ns.modules.Aaa.name).toBe("AAA");
                expect(ns.modules.Bbb.name).toBe("BBB");
                expect(ns.modules.ccc.Ddd.name).toBe("CCC.DDD");
                expect(ns.modules.eee).toBe(123);

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('aaa', moduleName("AAA"));
                ns.object('aaa.Bbb', objectName("AAA.BBB"))
                    .require('aaa');
                ns.init();

                expect(ns.modules.aaa.name).toBe("AAA");
                expect(ns.modules.aaa.Bbb.name).toBe("AAA.BBB");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.object('Aaa', objectName("AAA"));
                ns.module('Aaa.bbb', moduleName("AAA.BBB"))
                    .require('Aaa');
                ns.init();

                expect(ns.modules.Aaa.name).toBe("AAA");
                expect(ns.modules.Aaa.bbb.name).toBe("AAA.BBB");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('aaa', function() {
                    this.bbb = "AAA";
                });
                ns.module('aaa.bbb', moduleName("AAA.BBB"))
                    .require('aaa');

                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('aaa', function() {
                    this.Bbb = "AAA";
                });
                ns.object('aaa.Bbb', objectName("AAA.BBB"))
                    .require('aaa');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('aaa.bbb.ccc', moduleName("AAA.BBB.CCC"));
                ns.module('aaa.bbb', moduleName("AAA.BBB"))
                    .require('aaa.bbb.ccc');
                ns.init();

                expect(ns.modules.aaa.bbb.ccc.name).toBe("AAA.BBB.CCC");
                expect(ns.modules.aaa.bbb.name).toBe("AAA.BBB");

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('aaa.Bbb.ccc', function() {});
                ns.object('aaa.Bbb', objectName("AAA.BBB"))
                    .require('aaa');
                expect(function() {
                    ns.init();
                }).toThrow();
            });

            it("must inject valid dependencies", function() {
                ns.module('aaa',moduleName("AAA"));
                ns.module('bbb', function(modules) {
                    expect(modules.aaa.name).toBe("AAA");
                    this.name = "BBB";
                }).require('aaa');
                ns.object('Ccc', function(modules) {
                    expect(modules.aaa.name).toBe("AAA");
                    expect(modules.bbb.name).toBe("BBB");
                    return {
                        name: "CCC"
                    };
                }).require('bbb');
                ns.object("Ddd", function(modules) {
                    expect(modules.aaa.name).toBe("AAA");
                    expect(modules.bbb.name).toBe("BBB");
                    expect(modules.Ccc.name).toBe("CCC");
                    return {
                        name: "DDD"
                    };
                });
                ns.module('main', function(modules) {
                    expect(modules.aaa.name).toBe("AAA");
                    expect(modules.bbb.name).toBe("BBB");
                    expect(modules.Ccc.name).toBe("CCC");
                    expect(modules.Ddd.name).toBe("DDD");
                }).require('*');
                ns.init();

                //------------------------------------------------------------
                ns = new gumup.constructor();

                ns.module('bbb.ccc', moduleName("BBB.CCC"));
                ns.object('bbb.Ddd', objectName("BBB.DDD"));
                ns.module('aaa', function(modules) {
                    expect(modules.bbb.ccc.name).toBe("BBB.CCC");
                    expect(modules.bbb.Ddd.name).toBe("BBB.DDD");
                    expect(modules.bbb.name).toBeUndefined();
                    this.name = "AAA";
                }).require('bbb.*');
                ns.module('bbb', function(modules) {
                    expect(modules.aaa.name).toBe("AAA");
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

            it("must accept a valid module name", function() {
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

            it("must accept a valid module implementation", function() {
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

            it("must deny creating duplicates of modules", function() {
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

            it("must create a module of object", function() {
                var module = ns.object('Aaa', function() {});
                expect(typeof module.require).toBe("function");
            });

        });

        describe("Module.require", function() {

            var ns;

            beforeEach(function() {
                ns = new gumup.constructor();
            });

            it("must accept a valid required module name", function() {
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
