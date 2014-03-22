(function(namespace) {

    'use strict';

    describe("namespace", function() {

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

        it("must be an object", function() {
            expect(typeof namespace).toBe("object");
        });

        describe("namespace.import", function() {

            var ns, other;

            beforeEach(function() {
                ns = new namespace.constructor();
            });

            it("must import modules", function() {
                ns.module('aaa', moduleName("AAA"));
                ns.module('bbb', moduleName("BBB"));
                ns.object('bbb.Ddd', objectName("BBB.DDD"));
                ns.module('bbb.eee', moduleName("BBB.EEE"));
                ns.module('bbb.eee.fff', moduleName("BBB.EEE.FFF"));
                ns.object('Ccc', objectName("CCC"));

                //------------------------------------------------------------
                other = new namespace.constructor();

                other.import({
                    modules: []
                });
                other.init();

                expect(other.modules).toEqual({});
                //------------------------------------------------------------
                other = new namespace.constructor();

                other.import({
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
                other = new namespace.constructor();

                other.import({
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
                other = new namespace.constructor();

                other.import({
                    namespace: ns,
                    modules: ['aaa', 'Ccc']
                });
                other.init();

                expect(other.modules.aaa.name).toBe("AAA");
                expect(other.modules.bbb).toBeUndefined();
                expect(other.modules.Ccc.name).toBe("CCC");

                //------------------------------------------------------------
                other = new namespace.constructor();

                other.import({
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

            it("must import required modules", function() {
                ns.module('aaa', moduleName("AAA"));
                ns.object('Bbb', objectName("BBB"))
                        .require('aaa');
                ns.module('ccc', moduleName("CCC"))
                        .require('Bbb');
                ns.object('Ddd', objectName("DDD"))
                        .require('ccc');

                //------------------------------------------------------------
                other = new namespace.constructor();

                other.import({
                    namespace: ns,
                    modules: ['ccc']
                });
                other.init();

                expect(other.modules.aaa.name).toBe("AAA");
                expect(other.modules.Bbb.name).toBe("BBB");
                expect(other.modules.ccc.name).toBe("CCC");
                expect(other.modules.Ddd).toBeUndefined();

                //------------------------------------------------------------
                other = new namespace.constructor();

                other.import({
                    namespace: ns,
                    modules: ['Ddd']
                });
                other.init();

                expect(other.modules.aaa.name).toBe("AAA");
                expect(other.modules.Bbb.name).toBe("BBB");
                expect(other.modules.ccc.name).toBe("CCC");
                expect(other.modules.Ddd.name).toBe("DDD");
            });

            it("must inject dependencies", function() {
                ns.module('aaa', moduleName("AAA"));
                ns.object('Bbb', objectName("BBB"));

                //------------------------------------------------------------
                other = new namespace.constructor();

                other.import({});
                other.init();

                expect(other.modules).toEqual({});
                //------------------------------------------------------------
                other = new namespace.constructor();

                other.import({
                    dependencies: []
                });
                other.init();

                expect(other.modules).toEqual({});
                //------------------------------------------------------------
                other = new namespace.constructor();

                other.import({
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
                other = new namespace.constructor();

                other.import({
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

            it("must accept a valid module names", function() {
                for (var i = 0, len = validNames.length; i < len; i++) {
                    var name = validNames[i];
                    ns.module(name, function() {});
                }

                //------------------------------------------------------------
                other = new namespace.constructor();

                expect(function() {
                    other.import({
                        modules: 123
                    });
                }).toThrow();
                expect(function() {
                    other.import({
                        modules: "aaa"
                    });
                }).toThrow();
                expect(function() {
                    other.import({
                        modules: {}
                    });
                }).toThrow();
                expect(function() {
                    other.import({
                        modules: function() {}
                    });
                }).toThrow();

                //------------------------------------------------------------
                other = new namespace.constructor();

                for (var i = 0, len = validNames.length; i < len; i++) {
                    var name = validNames[i];
                    expect(function() {
                        other.import({
                            namespace: ns,
                            modules: [name]
                        });
                    }).not.toThrow();
                }
                for (var i = 0, len = requiredNames.length; i < len; i++) {
                    var name = requiredNames[i];
                    expect(function() {
                        other.import({
                            namespace: ns,
                            modules: [name]
                        });
                    }).not.toThrow();
                }
                for (var i = 0, len = invalidNames.length; i < len; i++) {
                    var name = invalidNames[i];
                    expect(function() {
                        other.import({
                            namespace: ns,
                            modules: [name]
                        });
                    }).toThrow();
                }
                for (var i = 0, len = objectNames.length; i < len; i++) {
                    var name = objectNames[i];
                    expect(function() {
                        other.import({
                            namespace: ns,
                            modules: [name]
                        });
                    }).toThrow();
                }
            });

            it("must accept a valid dependency names", function() {
                for (var i = 0, len = validNames.length; i < len; i++) {
                    var name = validNames[i];
                    ns.module(name, function() {});
                }

                //------------------------------------------------------------
                other = new namespace.constructor();

                expect(function() {
                    other.import({
                        dependencies: 123
                    });
                }).toThrow();
                expect(function() {
                    other.import({
                        dependencies: "aaa"
                    });
                }).toThrow();
                expect(function() {
                    other.import({
                        dependencies: {}
                    });
                }).toThrow();
                expect(function() {
                    other.import({
                        dependencies: function() {}
                    });
                }).toThrow();

                //------------------------------------------------------------
                other = new namespace.constructor();

                for (var i = 0, len = validNames.length; i < len; i++) {
                    var name = validNames[i];
                    expect(function() {
                        other.import({
                            dependencies: [
                                {
                                    name: name,
                                    implementation: {}
                                }
                            ]
                        });
                    }).not.toThrow();
                }
                for (var i = 0, len = requiredNames.length; i < len; i++) {
                    var name = requiredNames[i];
                    expect(function() {
                        other.import({
                            dependencies: [
                                {
                                    name: name,
                                    implementation: {}
                                }
                            ]
                        });
                    }).toThrow();
                }
                for (var i = 0, len = invalidNames.length; i < len; i++) {
                    var name = invalidNames[i];
                    expect(function() {
                        other.import({
                            dependencies: [
                                {
                                    name: name,
                                    implementation: {}
                                }
                            ]
                        });
                    }).toThrow();
                }
                for (var i = 0, len = objectNames.length; i < len; i++) {
                    var name = objectNames[i];
                    expect(function() {
                        other.import({
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
                other = new namespace.constructor();

                for (var i = 0, len = validNames.length; i < len; i++) {
                    var name = validNames[i];
                    expect(function() {
                        other.import({
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
                for (var i = 0, len = requiredNames.length; i < len; i++) {
                    var name = requiredNames[i];
                    expect(function() {
                        other.import({
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
                for (var i = 0, len = invalidNames.length; i < len; i++) {
                    var name = invalidNames[i];
                    expect(function() {
                        other.import({
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
                for (var i = 0, len = objectNames.length; i < len; i++) {
                    var name = objectNames[i];
                    expect(function() {
                        other.import({
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
                other = new namespace.constructor();

                expect(function() {
                    other.import({
                        namespace: ns,
                        modules: ['aaa', 'bbb']
                    });
                }).toThrow();

                //------------------------------------------------------------
                other = new namespace.constructor();

                ns.module('bbb', function() {});
                expect(function() {
                    other.import({
                        namespace: ns,
                        modules: ['aaa', 'bbb']
                    });
                }).not.toThrow();

                //------------------------------------------------------------
                other = new namespace.constructor();

                expect(function() {
                    other.import({
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

            it("must return the namespace for which it is called", function() {
                ns.module('aaa', function() {});
                other = new namespace.constructor();
                var actual = other.import({
                    namespace: ns,
                    modules: ['aaa']
                });
                expect(actual).toBe(other);
            });

        });

        describe("namespace.init", function() {

            var ns;

            beforeEach(function() {
                ns = new namespace.constructor();
            });

            it("must create a valid object in namespace", function() {

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
                ns = new namespace.constructor();

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
                ns = new namespace.constructor();

                ns.module('aaa', moduleName("AAA"));
                ns.object('aaa.Bbb', objectName("AAA.BBB"))
                        .require('aaa');
                ns.init();

                expect(ns.modules.aaa.name).toBe("AAA");
                expect(ns.modules.aaa.Bbb.name).toBe("AAA.BBB");

                //------------------------------------------------------------
                ns = new namespace.constructor();

                ns.object('Aaa', objectName("AAA"));
                ns.module('Aaa.bbb', moduleName("AAA.BBB"))
                        .require('Aaa');
                ns.init();

                expect(ns.modules.Aaa.name).toBe("AAA");
                expect(ns.modules.Aaa.bbb.name).toBe("AAA.BBB");

                //------------------------------------------------------------
                ns = new namespace.constructor();

                ns.module('aaa', function() {
                    this.bbb = "AAA";
                });
                ns.module('aaa.bbb', moduleName("AAA.BBB"))
                        .require('aaa');

                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new namespace.constructor();

                ns.module('aaa', function() {
                    this.Bbb = "AAA";
                });
                ns.object('aaa.Bbb', objectName("AAA.BBB"))
                        .require('aaa');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new namespace.constructor();

                ns.module('aaa.bbb.ccc', moduleName("AAA.BBB.CCC"));
                ns.module('aaa.bbb', moduleName("AAA.BBB"))
                        .require('aaa.bbb.ccc');
                ns.init();

                expect(ns.modules.aaa.bbb.ccc.name).toBe("AAA.BBB.CCC");
                expect(ns.modules.aaa.bbb.name).toBe("AAA.BBB");

                //------------------------------------------------------------
                ns = new namespace.constructor();

                ns.module('aaa.Bbb.ccc', function() {});
                ns.object('aaa.Bbb', objectName("AAA.BBB"))
                        .require('aaa');
                expect(function() {
                    ns.init();
                }).toThrow();
            });

            it("must inject a valid dependencies", function() {
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
                ns = new namespace.constructor();

                ns.module('bbb.ccc', moduleName("BBB.CCC"));
                ns.object('bbb.Ddd', objectName("BBB.DDD"));
                ns.module('aaa', function(modules) {
                    expect(modules.bbb.ccc.name).toBe("BBB.CCC");
                    expect(modules.bbb.Ddd.name).toBe("BBB.DDD");
                    expect(modules.bbb.name).toBeUndefined;
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
                ns = new namespace.constructor();

                expect(ns.solution).toBeUndefined();
                ns.module('c', init("C"))
                        .require('b');;
                ns.module('a', init("A"));
                ns.module('d', init("D"))
                        .require('*');
                ns.module('b', init("B"))
                        .require('a');
                ns.init();
                expect(ns.solution).toBe("ABCD");

                //------------------------------------------------------------
                ns = new namespace.constructor();

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
                ns = new namespace.constructor();

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
                ns = new namespace.constructor();

                ns.module('a', function() {}).require('b');
                ns.module('b', function() {}).require('c');
                ns.module('c', function() {}).require('a');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new namespace.constructor();

                ns.module('a', function() {}).require('*');
                ns.module('b', function() {}).require('*');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new namespace.constructor();

                ns.module('a', function() {}).require('*');
                ns.module('b', function() {}).require('c');
                ns.module('c', function() {}).require('a');
                expect(function() {
                    ns.init();
                }).toThrow();

                //------------------------------------------------------------
                ns = new namespace.constructor();

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

        describe("namespace.module", function() {

            var ns;

            beforeEach(function() {
                ns = new namespace.constructor();
            });

            it("must create a module", function() {
                var module = ns.module('aaa', function() {});
                expect(typeof module.require).toBe("function");
            });

            it("must accept a valid module names", function() {
                for (var i = 0, len = validNames.length; i < len; i++) {
                    var name = validNames[i];
                    expect(function() {
                        ns.module(name, function() {});
                    }).not.toThrow();
                }
                for (var i = 0, len = requiredNames.length; i < len; i++) {
                    var name = requiredNames[i];
                    expect(function() {
                        ns.module(name, function() {});
                    }).toThrow();
                }
                for (var i = 0, len = invalidNames.length; i < len; i++) {
                    var name = invalidNames[i];
                    expect(function() {
                        ns.module(name, function() {});
                    }).toThrow();
                }
                for (var i = 0, len = objectNames.length; i < len; i++) {
                    var name = objectNames[i];
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

        describe("namespace.object", function() {

            var ns;

            beforeEach(function() {
                ns = new namespace.constructor();
            });

            it("must create a module of object", function() {
                var module = ns.object('Aaa', function() {});
                expect(typeof module.require).toBe("function");
            });

        });

        describe("Module.require", function() {

            var ns;

            beforeEach(function() {
                ns = new namespace.constructor();
            });

            it("must accept a valid required module names", function() {
                for (var i = 0, len = validNames.length; i < len; i++) {
                    var name = validNames[i];
                    expect(function() {
                        ns.module("V" + i, function() {}).require(name);
                    }).not.toThrow();
                }
                for (var i = 0, len = requiredNames.length; i < len; i++) {
                    var name = requiredNames[i];
                    expect(function() {
                        ns.module("R" + i, function() {}).require(name);
                    }).not.toThrow();
                }
                for (var i = 0, len = invalidNames.length; i < len; i++) {
                    var name = invalidNames[i];
                    expect(function() {
                        ns.module("I" + i, function() {}).require(name);
                    }).toThrow();
                }
                for (var i = 0, len = objectNames.length; i < len; i++) {
                    var name = objectNames[i];
                    expect(function() {
                        ns.module("O" + i, function() {}).require(name);
                    }).toThrow();
                }
            });

            it("must return the module for which it is called", function() {
                var module = ns.module('aaa', function() {});
                var actual = module.require('bbb');
                expect(actual).toBe(module);
            });

        });

    });

})(namespace);
