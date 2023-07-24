const SeekableIterator = require('../util/SeekableIterator');

/**
 * Fake CustomObjectMgr
 *
 * Very simplisitic implementation providing just enough functionality to drive our tests.
 */
class CustomObjectMgr {
  _data = {
    PennyBlack_OrderWebhookQueue: {},
  };

  constructor(data) {
    this._data = data;
  }

  createCustomObject(collection, id) {
    if (!(collection in this._data)) {
      throw new Error('Fake CustomOrderMgr will only handle the PennyBlack_OrderWebhookQueue, received: ' + collection);
    }
    this._data[collection][id] = {
      custom: {
        order: id,
        site: null,
        status: 'pending',
        response_code: null,
        response_message: null,
      },
    };
    return this._data[collection][id];
  }

  queryCustomObjects(type, queryString, sortString, ...args) {
    if (type != 'PennyBlack_OrderWebhookQueue') {
      throw new Error('Fake CustomObjectMgr only implements searching PennyBlack_OrderWebhookQueue');
    }
    if (queryString != 'custom.site = {0} AND custom.status = {1}') {
      throw new Error('Fake CustomObjectMgr only implements searching by site and status');
    }
    if (sortString != 'creationDate asc') {
      throw new Error('Fake CustomObjectMgr only allows for null sorting by creationDate asc');
    }

    var site = args[0];
    var status = args[1];

    var results = [];

    for (let key in this._data[type]) {
      if (this._data[type][key].custom.site != site || this._data[type][key].custom.status != status) {
        continue;
      }
      results.push(this._data[type][key]);
    }

    return new SeekableIterator(results);
  }
}

module.exports = CustomObjectMgr;
