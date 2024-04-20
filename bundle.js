/** @format */

(function (modules) {
  function require(moduleId) {
    const module = { exports: {} };
    const [fn, mapping] = modules[moduleId];
    function localRequire(path) {
      const id = mapping[path];
      return require(id);
    }
    fn && fn(localRequire, module, module.exports);
    return module.exports;
  }
  require(1);
})({
  1: [
    function (require, module, exports) {
      'use strict';

      var _foo = require('./foo.js');
      console.log('main');
      (0, _foo.foo)();
    },
    { './foo.js': 2 },
  ],

  2: [
    function (require, module, exports) {
      'use strict';

      Object.defineProperty(exports, '__esModule', {
        value: true,
      });
      exports.foo = foo;
      var _bar = require('./bar.js');
      function foo() {
        (0, _bar.bar)();
        console.log('foo');
      }
    },
    { './bar.js': 3 },
  ],

  3: [
    function (require, module, exports) {
      'use strict';

      Object.defineProperty(exports, '__esModule', {
        value: true,
      });
      exports.bar = bar;
      function bar() {
        console.log('bar');
      }
    },
    {},
  ],
});
