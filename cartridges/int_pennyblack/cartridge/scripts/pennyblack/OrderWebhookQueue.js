var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var Site = require('dw/system/Site');

var { OrderWebhookStatus } = require('int_pennyblack/cartridge/scripts/pennyblack/OrderWebhook');

function OrderWebhookQueue() {
  this._queueName = 'PennyBlackOrderWebhookQueue';
  this._queueEntries = null;
}

OrderWebhookQueue.prototype.push = function (order) {
  var self = this;
  Transaction.wrap(function () {
    var queueEntry = CustomObjectMgr.createCustomObject(self._queueName, order.orderNo);
    queueEntry.custom.status = OrderWebhookStatus.PENDING;
    queueEntry.custom.site = Site.current.ID;
  });
};

OrderWebhookQueue.prototype.pop = function () {
    if (this._queueEntries == null) {
        this._loadEntries();
    }
    return (this._queueEntries.hasNext()) ? this._queueEntries.next() : false;
}

OrderWebhookQueue.prototype._loadEntries = function() {
    this._queueEntries = CustomObjectMgr.queryCustomObjects(this._queueName, 'custom.status = {0}', null, OrderWebhookStatus.PENDING);
};

module.exports = OrderWebhookQueue;
