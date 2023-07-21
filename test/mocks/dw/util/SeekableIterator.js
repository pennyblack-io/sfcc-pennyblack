/**
 * Fake SeekableIterator
 *
 * Very simplisitic implementation providing just enough functionality to drive our tests.
 */
class SeekableIterator {
  _collection;
  _index;

  constructor(collection) {
    this._collection = collection;
    this._index = 0;
  }

  get count() {
    return this._collection.length;
  }

  hasNext() {
    return this._index < this._collection.length;
  }

  next() {
    return this._collection[this._index++];
  }

  close() {
    return;
  }
}

module.exports = SeekableIterator;
