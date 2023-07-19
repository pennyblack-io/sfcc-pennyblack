const Iterator = require("./Iterator");

/**
 * Fake Collection
 * 
 * Very simplisitic implementation providing just enough functionality to drive our tests.
 */
class Collection {

    items

    constructor(items) {
        this.items = items;
    }

    iterator() {
        return new Iterator(this.items);
    }
}

module.exports = Collection;