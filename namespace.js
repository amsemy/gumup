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
     * Пространство имён.
     *
     * @constructor
     */
    var Namespace = function() {

        /**
         * Функция, создающая объявленный модуль.
         *
         * @callback  Declaration~callback
         * @param  {object} modules
         *         Инициализированные зависимые модули.
         * @returns  {object}
         *           Созданный модуль.
         */

        /**
         * Объявление модуля пространства имён.
         *
         * @constructor
         * @param  {Declaration~callback} implementation
         *         Реализация модуля.
         */
        var Declaration = this.Declaration = function(implementation) {
            this._dependencies = [];
            this._dependenciesUncapped = null;
            this._implementation = implementation;
        };

        /**
         * Добавляет зависимость от другого модуля.
         *
         * @param  {string} reqName
         *         Имя модуля. Можно указать зависимость от нескольких модулей
         *         с помощью символа звездочки '*'. Например, 'foo.*' добавит
         *         зависмость от всех модуелей, вложенных в 'foo' (кроме самого
         *         'foo'). Если модуль зависит от всех существующих модулей, то
         *         можно указать '*'.
         * @return  {Declaration}
         *          this.
         */
        Declaration.prototype.require = function(reqName) {
            if (!checkRequireName(reqName)) {
                throw error("Invalid require name '" + reqName + "'");
            }
            this._dependencies.push(reqName);
            return this;
        };

        this._cache = {
            inited: {},
            resolved: {},
            root: {}
        };

        this._declarations = {};

        /**
         * Инициализированные модули.
         *
         * @namespace
         */
        this.modules = {};

    };

    Namespace.prototype.constructor = Namespace;

    /**
     * Внедряемая зависимость.
     *
     * @namespace  Namespace~importDependency
     * @property  {string} module
     *            Имя модуля.
     * @property  {*} implementation
     *            Внедряемый объект. Если это строка, то она будет использована
     *            как имя модуля из импортируемого пространства имён.
     */

    /**
     * Параметры импорта.
     *
     * @namespace  Namespace~importSettings
     * @property  {Namespace} [namespace]
     *            Импортируемое пространство имён.
     * @property  {string[]} [modules]
     *            Имена импортируемых модулей. {@link Declaration#require}
     * @property  {Namespace~importDependency[]} [dependebcies]
     *            Внедряемые зависимости.
     */

    /**
     * Импортирует модули из другого пространства имён и внедряет зависимости.
     *
     * @param  {Namespace~importSettings} settings
     *         Параметры импорта.
     * @return  {Namespace}
     *          this.
     */
    Namespace.prototype.import = function(settings) {
        importModules(this, settings);
        importDependencies(this, settings);
        return this;
    };

    /**
     * Инициализирует объявленные модули приложения. Порядок инициализации
     * определяется зависимостями. Если модули не зависят друг от друга, то
     * их порядок инициализации не оговаривается.
     */
    Namespace.prototype.init = function() {
        this.Declaration.prototype.require = inited;
        this.init = inited;
        this.module = inited;
        for (var d in this._declarations) {
            this._cache.root[d] = true;
        }
        for (var d in this._declarations) {
            resolve(this._declarations, this._cache, d, []);
        }
        for (var d in this._cache.root) {
            initialize(this, this._declarations, this._cache, d);
        }
    };

    /**
     * Объявляет модуль в пространстве имён. Конструктор модуля будет вызван в
     * контексте уже сущетсвующего объекта в пространстве имён.
     *
     * @param  {string} name
     *         Имя модуля.
     * @param  {Declaration~callback} implementation
     *         Конструктор модуля.
     * @return  {Declaration}
     *          Объявление модуля.
     */
    Namespace.prototype.module = function(name, implementation) {
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
     * Объявляет модуль в пространстве имён. Фабрика модуля должна вернуть
     * объект, который затем будет размещён в пространстве имён.
     *
     * @param  {string} name
     *         Имя модуля.
     * @param  {Declaration~callback} implementation
     *         Фабрика модуля.
     * @return  {Declaration}
     *          Модуль приложения.
     */
    Namespace.prototype.object = function(name, implementation) {
        var decl = this.module(name, implementation);
        decl._isObject = true;
        return decl;
    };

    function checkModuleName(name) {
        return (name != null && moduleNamePattern.test(name));
    }

    function checkRequireName(name) {
        return (name != null && requireNamePattern.test(name));
    }

    function error(msg) {
        var err = new Error(msg);
        err.name = "NamespaceError";
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

    function importDependencies(namespace, settings) {
        var dependencies = (settings.dependencies == null
                ? [] : settings.dependencies);
        if (Object.prototype.toString.call(dependencies) !== "[object Array]") {
            throw error("Invalid dependencies array in import settings");
        }
        var srcDecls = null,
            destDecls = namespace._declarations,
            len = dependencies.length;
        for (var i = 0; i < len; i++) {
            var dependency = dependencies[i];
            if (typeof dependency === "object") {
                if (!checkModuleName(dependency.name)) {
                    throw error("Invalid dependency name '"
                            + dependency.name + "' in import settings");
                }
                var destName = dependency.name;
                if (typeof dependency.implementation === "string") {
                    if (srcDecls == null) {
                        if (!(settings.namespace instanceof Namespace)) {
                            throw error("Invalid namespace in import settings");
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
                    var decl = new namespace.Declaration((function(obj) {
                        return function() {
                            return obj;
                        };
                    })(dependency.implementation));
                    decl._isObject = true;
                    destDecls[destName] = decl;
                }
            } else {
                throw error("Invalid dependencies in import settings");
            }
        }
    }

    function importModules(namespace, settings) {
        var modules = (settings.modules == null ? [] : settings.modules);
        if (Object.prototype.toString.call(modules) !== "[object Array]") {
            throw error("Invalid modules array in import settings");
        }
        var len = modules.length;
        if (len > 0) {
            if (!(settings.namespace instanceof Namespace)) {
                throw error("Invalid namespace in import settings");
            }
            var srcDecls = settings.namespace._declarations,
                destDecls = namespace._declarations;
            for (var i = 0; i < len; i++) {
                var name = modules[i];
                if (!checkRequireName(name)) {
                    throw error("Invalid module name '"+ name
                            + "' in import settings");
                }
                forEach(srcDecls, name, function(depName) {
                    destDecls[depName] = srcDecls[depName];
                });
            }
        }
    }

    function indexOf(array, item) {
        var nativeIndexOf = Array.prototype.indexOf;
        if (nativeIndexOf && array.indexOf === nativeIndexOf) {
            return array.indexOf(item);
        }
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] === item) {
                return i;
            }
        }
        return -1;
    }

    function inited() {
        throw error("Namespace has already been inited");
    }

    function initialize(namespace, declarations, cache, name) {
        var decl = declarations[name];
        if (cache.inited[name] !== true) {
            var len = decl._dependenciesUncapped.length;
            for (var i = 0; i < len; i++) {
                initialize(namespace, declarations, cache,
                        decl._dependenciesUncapped[i]);
            }
            var module;
            if (decl._isObject === true) {
                module = decl._implementation(namespace.modules);
                extend(namespace.modules, name, module);
            } else {
                module = extend(namespace.modules, name);
                decl._implementation.call(module, namespace.modules);
            }
            cache.inited[name] = true;
        }
    }

    function resolve(declarations, cache, name, stack) {
        var decl = declarations[name];
        if (cache.resolved[name] !== true) {
            //if (indexOf(stack, name) != -1) {
            if (stack[name] === true) {
                throw error("Recursive dependency '" + name + "'");
            }
            //stack.push(name);
            stack[name] = true;
            decl._dependenciesUncapped = [];
            var len = decl._dependencies.length;
            for (var i = 0; i < len; i++) {
                var reqName = decl._dependencies[i];
                forEach(declarations, reqName, function(depName) {
                    if (depName !== name) {
                        delete cache.root[depName];
                        decl._dependenciesUncapped.push(depName);
                        resolve(declarations, cache, depName, stack);
                    }
                });
            }
            //stack.pop();
            delete stack[name];
            cache.resolved[name] = true;
        }
    }

    this.namespace = new Namespace();

}).call(this);
