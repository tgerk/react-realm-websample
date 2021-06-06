// EVIL MONKEY-PATCHING

Storage.prototype.getJSONItem = function (key, defaultValue) {
  try {
    let value = this.getItem(key);
    return JSON.parse(value) || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

Storage.prototype.setJSONItem = function (key, value) {
  this.setItem(key, JSON.stringify(value));
};
