const SeekableIterator = require('../util/SeekableIterator');

/**
 * Fake OrderMgr
 *
 * Very simplistic implementation providing just enough functionality to drive our tests.
 */
class OrderMgr {
  _data;

  constructor(data) {
    this._data = data;
  }

  searchOrders(queryString, sortString, ...args) {
    if (queryString != 'customerEmail = {0}') {
      throw new Error('Fake OrderMgr only implements searching by customerEmail');
    }
    if (sortString != null) {
      throw new Error('Fake OrderMgr only allows for null sortString');
    }
    return new SeekableIterator(args[0] in this._data ? this._data[args[0]] : []);
  }
}

module.exports = OrderMgr;
