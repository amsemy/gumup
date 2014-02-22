# Namespace.js

Namespace.js is simple JavaScript library that lets you organize your code with module-based approach.
Some of the features you get with Namespace.js:
- module-based namespaces
- control over order of modules initialization
- dependency injection

## Basic usage

Include Namespace.js in your page. The library unconditionally occupies a `namespace` global.
```html
<script src="namespace.js"></script>
```
Declare your moudles using `namespace.module`. Module implementation function will called in context of created module instance.

```javascript
(function(ns) {

    ns.module('utils.log', implementation);
    
    function implementation() {

        this.info = function(msg) {
            log(msg).className = "info";
        };

        this.debug = function(msg) {
            log(msg).className = "debug";
        };

        function log(msg) {
            var p = document.createElement("p");
            p.innerHTML = msg;
            return document.body.appendChild(p);
        }
        
    }

})(namespace);
```

Use `require` method of module to specify its dependencies.

```javascript
(function(ns) {

    var module = ns.module('main', implementation);
    
    module.require('utils.log');
    
    function implementation(modules) {
        var log = modules.utils.log;

        log.info("Init main");
        log.debug("Debug message");
    }

})(namespace);
```

Hook `namespace.init()` to the page load event. ([jsfiddle](http://jsfiddle.net/amsemy/pq3uj/))
