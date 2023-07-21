var Site = require('dw/system/Site');

function Config() {
  this._sites = null;
}

Config.prototype.get = function(name, siteId) {

  preferenceId = 'pennyblack_' + name;

  if (!siteId) {
    return Site.current.getCustomPreferenceValue(preferenceId)
  }

  if (this._sites == null) {
    this._sites = this._mapSitesbyId();
  }

  if (!(siteId in this._sites)) {
    return null;
  }

  return this._sites[siteId].getCustomPreferenceValue(preferenceId);
}

Config.prototype._mapSitesbyId = function() {
  var sites = Site.getAllSites().iterator();
  this._sites = {};
  while (sites.hasNext()) {
    var site = sites.next();
    this._sites[site.ID] = site;
  }
}

module.exports = (new Config());
