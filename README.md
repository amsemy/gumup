# Gumup

Gumup is simple JavaScript library that lets to control the order of modules initialization.

## Basic usage

Include Gumup in your page. The library unconditionally occupies a `gumup` global.
```html
<script src="gumup.js"></script>
```
Declare your moudles using `gumup.unit`. Unit implementation function will called in context of created unit instance.
```javascript
gumup.unit('common.foo', function() {
    this.myFunc = function() {};
});
```
If you need a custom object, it can be returned from the implementation function. It can be an object, function or primitive.
```javascript
gumup.unit('utils.bar', function() {
    return "my unit";
});
```
Use `require` method of module to specify its dependencies.
```javascript
var unit = gumup.unit('main', implementation);

unit.require('common.foo');
unit.require('utils.bar');

function implementation(units) {
    units.common.foo.myFunc();
    units.utils.bar;
}
```
Hook `gumup.init()` to the page load event.
