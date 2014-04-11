# Gumup

Gumup is simple JavaScript library that lets you organize your code with module-based approach.
Some of the features you get with Gumup:
- module-based namespaces
- control over order of modules initialization
- dependency injection

## Basic usage

Include Gumup in your page. The library unconditionally occupies a `gumup` global.
```html
<script src="gumup.js"></script>
```
Declare your moudles using `gumup.module`. Module implementation function will called in context of created module instance.

```javascript
gumup.module('utils.log', implementation);

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
```

Use `require` method of module to specify its dependencies.

```javascript
var module = gumup.module('main', implementation);

module.require('utils.log');

function implementation(modules) {
    var log = modules.utils.log;

    log.info("Init main");
    log.debug("Debug message");
}
```

Hook `gumup.init()` to the page load event. ([jsfiddle](http://jsfiddle.net/amsemy/pq3uj/))
