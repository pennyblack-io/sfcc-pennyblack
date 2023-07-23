/**
 * Fake Site
 *
 * Very simplisitic implementation providing just enough functionality to drive our tests.
 */
class Site {
  _preferences;

  constructor(preferences) {
    this._preferences = preferences;
  }

  getCustomPreferenceValue(name) {
    if (!(name in this._preferences)) {
      return null;
    }
    return this._preferences[name];
  }

  get current() {
    return this;
  }
}

module.exports = Site;
