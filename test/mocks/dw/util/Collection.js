const Iterator = require('./Iterator');

/**
 * Fake Collection
 *
 * Very simplisitic implementation providing just enough functionality to drive our tests.
 */
class Collection {
  _items;

  constructor(items) {
    this._items = items;
  }

  iterator() {
    return new Iterator(this._items);
  }

  get length() {
    return this._items.length;
  }
}

module.exports = Collection;
