(function (modules) {
  function require(moduleId) {
    const module = { exports: {} };
    const fn = modules[moduleId];
    fn && fn(require, module, module.exports);
    return module.exports;
  }
  require('./example/main.js');
})({
  './foo.js': function fooModule(require, module, exports) {
    exports.foo = function () {
      console.log('foo');
    };
  },
  './example/main.js': function mainModule(require, module, exports) {
    const { foo } = require('./foo.js');
    console.log('main');
    foo();
  },
});
