const SeekableIterator = require('../util/SeekableIterator');

/**
 * Fake OrderMgr
 *
 * Very simplistic implementation providing just enough functionality to drive our tests.
 */
class OrderMgr {
  _data;

  constructor(data) {
    Object.keys(data).forEach((key) => {
      if (data[key].hasOwnProperty('creationDate')) {
        data[key].creationDate = new Date(data[key].creationDate);
      }
    });

    this._data = data;
  }

  searchOrders(queryString, sortString, ...args) {
    if (queryString != 'customerEmail = {0} AND creationDate < {1}') {
      throw new Error('Fake OrderMgr only supports the query string "customerEmail = {0} AND creationDate < {1}"');
    }
    if (sortString != null) {
      throw new Error('Fake OrderMgr only allows for null sortString');
    }

    let email = args[0];
    let cutOffDate = args[1];

    let orders = this._data[email] || [];

    let filteredOrders = orders.filter(order => {
      let orderDate = new Date(order.creationDate);
      return orderDate < cutOffDate;
    });

    return new SeekableIterator(filteredOrders);
  }
}

module.exports = OrderMgr;
