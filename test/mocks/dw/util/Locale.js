const DataLoader = require('../../../data/DataLoader');

/**
 * Fake Locale
 *
 * Very simplisitic implementation providing just enough functionality to drive our tests.
 */
class Locale {
  constructor(data) {
    Object.assign(this, data);
  }

  static getLocale(id) {
    return new Locale(DataLoader('locale', id));
  }
}

module.exports = Locale;
