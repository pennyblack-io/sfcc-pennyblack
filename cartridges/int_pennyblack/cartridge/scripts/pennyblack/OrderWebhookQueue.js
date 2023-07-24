var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');

var Config = require('int_pennyblack/cartridge/scripts/pennyblack/Config');
var OrderWebhook = require('int_pennyblack/cartridge/scripts/pennyblack/OrderWebhook');

function OrderWebhookQueue() {
  this._logger = Logger.getLogger('PennyBlack', 'OrderWebhookQueue');
  this._queueEntries = null;
}

OrderWebhookQueue.prototype._queueName = 'PennyBlack_OrderWebhookQueue';

OrderWebhookQueue.prototype.push = function (order) {
  var self = this;

  if (!Config.get('enabled') || !this._isValidOrder(order)) {
    return false;
  }

  Transaction.wrap(function () {
    var queueEntry = CustomObjectMgr.createCustomObject(self._queueName, order.orderNo);
    queueEntry.custom.status = OrderWebhook.Status.PENDING;
    queueEntry.custom.site = Site.current.ID;
    self._logger.info('order: {0}, pushed on to queue', order.orderNo);
  });

  return true;
};

OrderWebhookQueue.prototype.pop = function () {
  if (this._queueEntries == null) {
    this._loadEntries();
  }
  return this._queueEntries.hasNext() ? this._queueEntries.next() : false;
};

OrderWebhookQueue.prototype._loadEntries = function () {
  this._queueEntries = CustomObjectMgr.queryCustomObjects(
    this._queueName,
    'custom.site = {0} AND custom.status = {1}',
    'creationDate asc',
    Site.current.ID,
    OrderWebhook.Status.PENDING,
  );

  this._logger.debug('queue loaded, site: {0}, size: {1}', Site.current.ID, this._queueEntries.count);
};

OrderWebhookQueue.prototype._isValidOrder = function (order) {
  if (order === null) {
    this._logger.warn('order is null, expected an dw.order.Order object');
    return false;
  }

  if (typeof order !== 'object') {
    this._logger.warn('order is of type {0}, expected an dw.order.Order object', typeof order);
    return false;
  }

  if (!('orderNo' in order)) {
    this._logger.warn('order is missing orderNo property');
    return false;
  }

  if (!order.orderNo) {
    this._logger.warn('orderNo of provided order is empty');
    return false;
  }

  return true;
};

module.exports = OrderWebhookQueue;
