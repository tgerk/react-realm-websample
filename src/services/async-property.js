// EVIL MONKEY-PATCHING, and on the

Object.defineAsyncProperty = function (obj, name) {
  // create a shadow property (the promise), a status flag, and an accessor (getter/setter)
  const shadow = `__${name}`,
    resolver = `__${name}_resolver`,
    resolved = `__${name}_resolved`;
  Object.defineProperty(obj, resolved, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: false,
  });
  Object.defineProperty(obj, resolver, {
    configurable: true,
    enumerable: false,
    writable: true,
  });
  Object.defineProperty(obj, shadow, {
    configurable: true,
    enumerable: false,
    writable: false,
    value: new Promise((resolve) => {
      obj[resolver] = resolve;
    }),
  });
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: true,
    get: async function () {
      return await obj[shadow];
    },
    set: function (v) {
      if (this[resolved]) {
        // re-setting
        // need to replace the shadow promise with the new resolution
        // because resolved should not be any pending getters
        Object.defineProperty(this, shadow, {
          configurable: true,
          enumerable: false,
          writable: false,
          value: Promise.resolve(v),
        });
        return;
      }

      this[resolver](v);
      this[resolved] = true;
      this[resolver] = undefined;
    },
  });
};
