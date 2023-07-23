var Site = require('dw/system/Site');

function Config() {}

Config.prototype._defaults = {
  enabled: false,
  mode: 'production',
  apiKey: '',
};

Config.prototype.get = function (name) {
  var value = Site.current.getCustomPreferenceValue('pennyblack_' + name);
  if (value == null) {
    return this._defaults[name];
  }
  return value;
};

var instance = new Config();

module.exports = instance;
