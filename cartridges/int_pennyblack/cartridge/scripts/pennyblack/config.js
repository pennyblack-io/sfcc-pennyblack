var System = require('dw/system');

function getConfig() {
    var config = {};
    var site = System.Site.getCurrent();
    config.enabled = site.getCustomPreferenceValue('pennyblack_enabled');
    config.apiKey = site.getCustomPreferenceValue('pennyblack_apiKey');
    return config;
}

module.exports = getConfig();
