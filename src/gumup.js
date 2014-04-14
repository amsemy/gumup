(function() {

    /*
     *  unitName
     *      :   IDENTIFIER ( '.' IDENTIFIER )*
     *      ;
     *
     *  requireName
     *      :   unitName ('.' '*')?
     *      |   '*'
     *      ;
     *
     *  IDENTIFIER
     *      :   ('A'..'Z' | 'a'..'z' | '_' | '$') ('A'..'Z' | 'a'..'z' | '0'..'9' | '_'  | '$')*
     *      ;
     */
    var unitNamePattern = /^(?:[A-Za-z_\$][\w\$]*(?:\.[A-Za-z_\$][\w\$]*)*)$/,
        requireNamePattern = /^(?:[A-Za-z_\$][\w\$]*(?:\.[A-Za-z_\$][\w\$]*)*(?:\.\*)?|\*)$/;

    /**
     * Create a Gumup namespace. The namespace consist of units which can be
     * modules, objects or constructors.
     *
     * @constructor
     */
    var Gumup = function() {

        /**
         * Initialize the unit.
         *
         * @callback  Gumup~implementation
         * @param  {Gumup#units} units
         *         Hash of initialized units.
         * @returns  {object}
         *           Initialized unit.
         */

        /**
         * Create a unit declaration.
         *
         * @constructor
         * @param  {Gumup~implementation} implementation
         *         Function of unit initialization.
         */
        var Declaration = this.Declaration = function(implementation) {
            this._dependencies = [];
            this._implementation = implementation;
        };

        /**
         * Add dependency on the another unit.
         *
         * @param  {string} reqName
         *         Dependent unit name. It supports masks using `*` symbol.
         *         For example, the mask `foo.*` matches all the nested units
         *         of `foo` module (except the `foo` module). If the unit
         *         depends on all existing units, the mask `*` can be used.
         * @return  {Gumup~Declaration}
         *          Itself.
         */
        Declaration.prototype.require = function(reqName) {
            if (!checkRequireName(reqName)) {
                throw error("Invalid require name '" + reqName + "'");
            }
            this._dependencies.push(reqName);
            return this;
        };

        this._declarations = {};

        /**
         * Hash that contains the initialized units.
         *
         * @namespace
         */
        this.units = {};

    };

    Gumup.prototype.constructor = Gumup;

    /**
     * Initialize the Gumup namespace with declared units. Initialization
     * order of units depends on dependency resolution.
     */
    Gumup.prototype.init = function() {
        this.Declaration.prototype.require = inited;
        this.init = inited;
        this.module = inited;
        var cache = {
            // Declaration dependencies with uncapped `*` mask
            dependencies: {},
            // Units that have already been initialized
            inited: {},
            // Units that have already been resolved
            resolved: {},
            // Independent units
            root: {}
        };
        var d;
        for (d in this._declarations) {
            cache.dependencies[d] = [];
            cache.root[d] = true;
        }
        for (d in this._declarations) {
            resolve(this._declarations, d, cache, {});
        }
        for (d in cache.root) {
            initialize(this, this._declarations, d, cache);
        }
    };

    /**
     * Create a unit declaration with initializer as implementation function.
     * It'll be called in context of existing object.
     *
     * @param  {string} name
     *         Unit name.
     * @param  {Gumup~implementation} implementation
     *         Initialization function.
     * @return  {Gumup~Declaration}
     *          Unit declaration.
     */
    Gumup.prototype.module = function(name, implementation) {
        if (!checkUnitName(name)) {
            throw error("Invalid unit name '" + name + "'");
        }
        if (typeof implementation != "function") {
            throw error("Invalid implementation of '" + name + "' unit");
        }
        if (this._declarations[name]) {
            throw error("Unit '" + name + "' has already been declared");
        }
        return this._declarations[name] = new this.Declaration(implementation);
    };

    /**
     * Create a unit declaration with factory as implementation function.
     * It must return ready-to-use unit object.
     *
     * @param  {string} name
     *         Unit name.
     * @param  {Gumup~implementation} implementation
     *         Factory function.
     * @return  {Gumup~Declaration}
     *          Unit declaration.
     */
    Gumup.prototype.object = function(name, implementation) {
        var decl = this.module(name, implementation);
        decl._type = "object";
        return decl;
    };

    /**
     * Dependency injections settings.
     *
     * @namespace  Gumup~pickDependency
     * @property  {string} unit
     *            Unit name that'll be assigned to injected object.
     * @property  {*} implementation
     *            Any object that'll be injected. If it is string, then object
     *            will be picked from the picked namespace.
     */

    /**
     * Pick settings.
     *
     * @namespace  Gumup~pickSettings
     * @property  {Gumup} [namespace]
     *            Picked namespace.
     * @property  {string[]} [units]
     *            Unit names to be picked. {@link Declaration#require}
     * @property  {Gumup~pickDependency[]} [dependecies]
     *            Dependencies to be injected.
     */

    /**
     * Copy unit declarations from the another Gumup namespace with theirs
     * dependencies.
     *
     * @param  {Gumup~pickSettings} settings
     *         Pick settings.
     * @return  {Gumup}
     *          Itself.
     */
    Gumup.prototype.pick = function(settings) {
        pickUnits(this, settings);
        pickDependencies(this, settings);
        return this;
    };

    function checkRequireName(name) {
        return (name && requireNamePattern.test(name));
    }

    function checkUnitName(name) {
        return (name && unitNamePattern.test(name));
    }

    function error(msg) {
        var err = new Error(msg);
        err.name = "GumupError";
        return err;
    }

    // Places the unit object to the namespace
    function extend(parent, name, obj) {
        var parts = name.split(".");
        var path = "";
        for (var i = 0, len = parts.length; i < len; i++) {
            var part = parts[i];
            var current = parent[part];
            path += part + (i + 1 < len ? "." : "");
            if (i + 1 == len) {
                if (current == null) {
                    current = (obj == null ? {} : obj);
                    parent[part] = current;
                } else {
                    if (obj != null || typeof current != "object") {
                        throw error("Cann't init unit '" + name
                                + "' because there is an object on this path");
                    }
                }
                return current;
            } else {
                if (current != null && typeof current != "object") {
                    throw error("Cann't init unit '" + name
                            + "' because path element '" + path
                            + "' isn't an object");
                }
                parent[part] = (current == null ? {} : current);
            }
            parent = parent[part];
        }
    }

    // Iterate over declarations, executing a callback function for each matched
    // dependency
    function forEach(declarations, reqName, callback) {
        var d;
        if (reqName == "*") {
            // Iterate over all declarations
            for (d in declarations) {
                callback.call(this, d);
            }
        } else if (reqName.charAt(reqName.length - 1) == "*") {
            // Iterate over uncapped `*` declarations
            var baseName = reqName.substring(0, reqName.length - 1);
            for (d in declarations) {
                if (d.indexOf(baseName) == 0) {
                    callback.call(this, d);
                }
            }
        } else {
            // A single dependency iteration
            if (declarations[reqName]) {
                callback.call(this, reqName);
            } else {
                throw error("Invalid dependency '" + reqName + "'");
            }
        }
    }

    function isArray(obj) {
        return Object.prototype.toString.call(obj) == "[object Array]";
    }

    // TODO: 1
    function pickDependencies(dest, settings) {
        var dependencies = settings.dependencies || [];
        if (!isArray(dependencies)) {
            throw error("Invalid dependencies array in pick settings");
        }
        var srcDecls = null,
            destDecls = dest._declarations,
            len = dependencies.length;
        for (var i = 0; i < len; i++) {
            var dependency = dependencies[i];
            if (typeof dependency === "object") {
                if (!checkUnitName(dependency.name)) {
                    throw error("Invalid dependency name '"
                            + dependency.name + "' in pick settings");
                }
                var destName = dependency.name;
                if (typeof dependency.implementation === "string") {
                    if (srcDecls == null) {
                        if (!(settings.namespace instanceof Gumup)) {
                            throw error("Invalid namespace in pick settings");
                        }
                        srcDecls = settings.namespace._declarations;
                    }
                    if (!checkUnitName(dependency.implementation)) {
                        throw error("Invalid dependency implementation'"
                                + dependency.implementation + "'");
                    }
                    var srcName = dependency.implementation;
                    if (srcDecls[srcName] == null) {
                        throw error("Invalid dependency '" + srcName + "'");
                    }
                    destDecls[destName] = srcDecls[srcName];
                } else {
                    var decl = new dest.Declaration((function(obj) {
                        return function() {
                            return obj;
                        };
                    })(dependency.implementation));
                    decl._type = "object";
                    destDecls[destName] = decl;
                }
            } else {
                throw error("Invalid dependencies in pick settings");
            }
        }
    }

    function pickUnit(srcDecls, destDecls, name, picked, stack) {
        forEach(srcDecls, name, function(depName) {
            if (picked[depName] !== true) {
                if (stack[depName] === true) {
                    throw error("Recursive dependency '" + depName + "'");
                }
                stack[depName] = true;
                var decl = srcDecls[depName];
                var len = decl._dependencies.length;
                for (var i = 0; i < len; i++) {
                    var reqName = decl._dependencies[i];
                    pickUnit(srcDecls, destDecls, reqName, picked, stack);
                }
                destDecls[depName] = decl;
                picked[depName] = true;
            }
        });
    }

    // TODO: 1
    function pickUnits(dest, settings) {
        var units = settings.units || [];
        if (!isArray(units)) {
            throw error("Invalid units array in pick settings");
        }
        var len = units.length;
        if (len > 0) {
            if (!(settings.namespace instanceof Gumup)) {
                throw error("Invalid namespace in pick settings");
            }
            var picked = {},
                srcDecls = settings.namespace._declarations,
                destDecls = dest._declarations;
            for (var i = 0; i < len; i++) {
                var name = units[i];
                if (!checkRequireName(name)) {
                    throw error("Invalid unit name '"+ name
                            + "' in pick settings");
                }
                pickUnit(srcDecls, destDecls, name, picked, {});
            }
        }
    }

    // Dummy to avoid namespace editing in its initialization
    function inited() {
        throw error("Gumup namespace has already been initialized");
    }

    // Create unit object in namespace
    function initialize(dest, declarations, name, cache) {
        var decl = declarations[name];
        if (!cache.inited[name]) {
            // Create unit dependencies first
            var len = cache.dependencies[name].length;
            for (var i = 0; i < len; i++) {
                initialize(dest, declarations,
                    cache.dependencies[name][i], cache);
            }
            // Create unit object
            var unit;
            if (decl._type == "object") {
                unit = decl._implementation(dest.units);
                extend(dest.units, name, unit);
            } else {
                unit = extend(dest.units, name);
                decl._implementation.call(unit, dest.units);
            }
            cache.inited[name] = true;
        }
    }

    // Check and prepare (uncap `*` mask) unit dependencies
    function resolve(declarations, name, cache, stack) {
        var decl = declarations[name];
        if (!cache.resolved[name]) {
            if (stack[name] === true) {
                throw error("Recursive dependency '" + name + "'");
            }
            stack[name] = true;
            var len = decl._dependencies.length;
            for (var i = 0; i < len; i++) {
                var reqName = decl._dependencies[i];
                forEach(declarations, reqName, function(depName) {
                    if (depName !== name) {
                        delete cache.root[depName];
                        cache.dependencies[name].push(depName);
                        resolve(declarations, depName, cache, stack);
                    }
                });
            }
            cache.resolved[name] = true;
        }
    }

    this.gumup = new Gumup();

}).call(this);
