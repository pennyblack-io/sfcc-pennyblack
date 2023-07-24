/**
 * Fake Site
 *
 * Very simplisitic implementation providing just enough functionality to drive our tests.
 */
class Site {
  _preferences;
  _id;

  constructor(preferences, id) {
    this._preferences = preferences;
    this._id = id;
  }

  getCustomPreferenceValue(name) {
    if (!(name in this._preferences)) {
      return null;
    }
    return this._preferences[name];
  }

  get ID() {
    return this._id;
  }

  get current() {
    return this;
  }
}

module.exports = Site;
