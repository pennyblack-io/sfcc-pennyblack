/**
 * Fake Iterator
 * 
 * Very simplisitic implementation providing just enough functionality to drive our tests.
 */
class Iterator {

    _collection
    _index

    constructor(collection) {
        this._collection = collection;
        this._index = 0;
    }

    hasNext() {
        return this._index < this._collection.length;
    }

    next() {
        return this._collection[this._index++];
    }
}

module.exports = Iterator;
