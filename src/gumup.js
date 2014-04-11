(function() {

    /*
     *  moduleName
     *      :   IDENTIFIER ( '.' IDENTIFIER )*
     *      ;
     *
     *  requireName
     *      :   moduleName ('.' '*')?
     *      |   '*'
     *      ;
     *
     *  IDENTIFIER
     *      :   ('A'..'Z' | 'a'..'z' | '_' | '$') ('A'..'Z' | 'a'..'z' | '0'..'9' | '_'  | '$')*
     *      ;
     */
    var moduleNamePattern = /^(?:[A-Za-z_\$][\w\$]*(?:\.[A-Za-z_\$][\w\$]*)*)$/,
        requireNamePattern = /^(?:[A-Za-z_\$][\w\$]*(?:\.[A-Za-z_\$][\w\$]*)*(?:\.\*)?|\*)$/;

    /**
     * Create a dynamic namespace.
     *
     * @constructor
     */
    var Gumup = function() {

        /**
         * Initialize the module.
         *
         * @callback  Gumup~implementation
         * @param  {Gumup#modules} modules
         *         Hash of initialized modules.
         * @returns  {object}
         *           Initialized module.
         */

        /**
         * Create a module declaration.
         *
         * @constructor
         * @param  {Gumup~implementation} implementation
         *         Function of module initialization.
         */
        var Declaration = this.Declaration = function(implementation) {
            this._dependencies = [];
            this._dependenciesUncapped = null;
            this._implementation = implementation;
        };

        /**
         * Add dependency on the another module.
         *
         * @param  {string} reqName
         *         Dependent module name. It supports masks using `*` symbol.
         *         For example, the mask `foo.*` matches all the nested modules
         *         of `foo` module (except the `foo` module). If the module
         *         depends on all existing modules, the mask `*` can be used.
         * @return  {Declaration}
         *          Itself.
         */
        // Add a dependency to the module.
        Declaration.prototype.require = function(reqName) {
            if (!checkRequireName(reqName)) {
                throw error("Invalid require name '" + reqName + "'");
            }
            this._dependencies.push(reqName);
            return this;
        };

        this._declarations = {};

        /**
         * Hash that contains the initialized modules.
         *
         * @namespace
         */
        this.modules = {};

    };

    Gumup.prototype.constructor = Gumup;

    /**
     * Initialize the Gumup namespace with declared modules. Initialization
     * order of modules depends on dependency resolution.
     */
    Gumup.prototype.init = function() {
        var cache = {
            inited: {},
            resolved: {},
            root: {}
        };
        this.Declaration.prototype.require = inited;
        this.init = inited;
        this.module = inited;
        for (var d in this._declarations) {
            cache.root[d] = true;
        }
        for (var d in this._declarations) {
            resolve(this._declarations, d, cache, {});
        }
        for (var d in cache.root) {
            initialize(this, this._declarations, d, cache);
        }
    };

    /**
     * Create a module declaration with initializer as implementation function.
     * It'll be called in context of existing object.
     *
     * @param  {string} name
     *         Module name.
     * @param  {Gumup~implementation} implementation
     *         Initialization function.
     * @return  {Declaration}
     *          Module declaration.
     */
    Gumup.prototype.module = function(name, implementation) {
        if (!checkModuleName(name)) {
            throw error("Invalid module name '" + name + "'");
        }
        if (typeof implementation !== "function") {
            throw error("Invalid implementation of '" + name + "' module");
        }
        if (this._declarations[name] == null) {
            var decl = new this.Declaration(implementation);
            this._declarations[name] = decl;
            return decl;
        } else {
            throw error("Module '" + name + "' has already been declared");
        }
    };

    /**
     * Create a module declaration with factory as implementation function.
     * It must return ready-to-use module object.
     *
     * @param  {string} name
     *         Module name.
     * @param  {Gumup~implementation} implementation
     *         Factory function.
     * @return  {Declaration}
     *          Module declaration.
     */
    Gumup.prototype.object = function(name, implementation) {
        var decl = this.module(name, implementation);
        decl._isObject = true;
        return decl;
    };

    /**
     * Dependency injections settings.
     *
     * @namespace  Gumup~pickDependency
     * @property  {string} module
     *            Module name that'll be assigned to injected object.
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
     * @property  {string[]} [modules]
     *            Module names to be picked. {@link Declaration#require}
     * @property  {Gumup~pickDependency[]} [dependecies]
     *            Dependencies to be injected.
     */

    /**
     * Copy module declarations from the another Gumup namespace with theirs
     * dependencies.
     *
     * @param  {Gumup~pickSettings} settings
     *         Pick settings.
     * @return  {Gumup}
     *          Itself.
     */
    Gumup.prototype.pick = function(settings) {
        pickModules(this, settings);
        pickDependencies(this, settings);
        return this;
    };

    function checkModuleName(name) {
        return (name != null && moduleNamePattern.test(name));
    }

    function checkRequireName(name) {
        return (name != null && requireNamePattern.test(name));
    }

    function error(msg) {
        var err = new Error(msg);
        err.name = "GumupError";
        return err;
    }

    function extend(parent, name, obj) {
        var parts = name.split(".");
        function getPath(len) {
            var path = "";
            for (var i = 0; i < len; i++) {
                path += parts[i] + (i + 1 < len ? "." : "");
            }
            return path;
        }
        for (var i = 0, len = parts.length; i < len; i++) {
            var part = parts[i];
            var current = parent[part];
            if (i + 1 == len) {
                if (current == null) {
                    current = (obj == null ? {} : obj);
                    parent[part] = current;
                } else {
                    if (obj != null
                            || typeof current !== "object") {
                        throw error("Cann't init module '" + name
                                + "' because there is an object on this path");
                    }
                }
                return current;
            } else {
                if (current != null && typeof current !== "object") {
                    throw error("Cann't init module '" + name
                            + "' because path element '" + getPath(i)
                            + "' isn't an object");
                }
                parent[part] = (current == null ? {} : current);
            }
            parent = parent[part];
        }
    };

    function forEach(declarations, reqName, callback) {
        if (reqName === "*") {
            for (var d in declarations) {
                callback.call(this, d);
            }
        } else if (reqName.charAt(reqName.length - 1) === "*") {
            var baseName = reqName.substring(0, reqName.length - 1);
            for (var d in declarations) {
                if (d.indexOf(baseName) === 0) {
                    callback.call(this, d);
                }
            }
        } else {
            if (declarations[reqName] != null) {
                callback.call(this, reqName);
            } else {
                throw error("Invalid dependency '" + reqName + "'");
            }
        }
    }

    function pickDependencies(dest, settings) {
        var dependencies = (settings.dependencies == null
                ? [] : settings.dependencies);
        if (Object.prototype.toString.call(dependencies) !== "[object Array]") {
            throw error("Invalid dependencies array in pick settings");
        }
        var srcDecls = null,
            destDecls = dest._declarations,
            len = dependencies.length;
        for (var i = 0; i < len; i++) {
            var dependency = dependencies[i];
            if (typeof dependency === "object") {
                if (!checkModuleName(dependency.name)) {
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
                    if (!checkModuleName(dependency.implementation)) {
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
                    decl._isObject = true;
                    destDecls[destName] = decl;
                }
            } else {
                throw error("Invalid dependencies in pick settings");
            }
        }
    }

    function pickModule(srcDecls, destDecls, name, picked, stack) {
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
                    pickModule(srcDecls, destDecls, reqName, picked, stack);
                }
                destDecls[depName] = decl;
                picked[depName] = true;
            }
        });
    }

    function pickModules(dest, settings) {
        var modules = (settings.modules == null ? [] : settings.modules);
        if (Object.prototype.toString.call(modules) !== "[object Array]") {
            throw error("Invalid modules array in pick settings");
        }
        var len = modules.length;
        if (len > 0) {
            if (!(settings.namespace instanceof Gumup)) {
                throw error("Invalid namespace in pick settings");
            }
            var picked = {},
                srcDecls = settings.namespace._declarations,
                destDecls = dest._declarations;
            for (var i = 0; i < len; i++) {
                var name = modules[i];
                if (!checkRequireName(name)) {
                    throw error("Invalid module name '"+ name
                            + "' in pick settings");
                }
                pickModule(srcDecls, destDecls, name, picked, {});
            }
        }
    }

    function inited() {
        throw error("Gumup namespace has already been inited");
    }

    function initialize(dest, declarations, name, cache) {
        var decl = declarations[name];
        if (cache.inited[name] !== true) {
            var len = decl._dependenciesUncapped.length;
            for (var i = 0; i < len; i++) {
                initialize(dest, declarations,
                        decl._dependenciesUncapped[i], cache);
            }
            var module;
            if (decl._isObject === true) {
                module = decl._implementation(dest.modules);
                extend(dest.modules, name, module);
            } else {
                module = extend(dest.modules, name);
                decl._implementation.call(module, dest.modules);
            }
            cache.inited[name] = true;
        }
    }

    function resolve(declarations, name, cache, stack) {
        var decl = declarations[name];
        if (cache.resolved[name] !== true) {
            if (stack[name] === true) {
                throw error("Recursive dependency '" + name + "'");
            }
            stack[name] = true;
            decl._dependenciesUncapped = [];
            var len = decl._dependencies.length;
            for (var i = 0; i < len; i++) {
                var reqName = decl._dependencies[i];
                forEach(declarations, reqName, function(depName) {
                    if (depName !== name) {
                        delete cache.root[depName];
                        decl._dependenciesUncapped.push(depName);
                        resolve(declarations, depName, cache, stack);
                    }
                });
            }
            cache.resolved[name] = true;
        }
    }

    this.gumup = new Gumup();

}).call(this);
