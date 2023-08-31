var HTTPClient = require('dw/net/HTTPClient');
var Logger = require('dw/system/Logger');
var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');

var Config = require('int_pennyblack/cartridge/scripts/pennyblack/Config');
var OrderToPayloadTransformer = require('int_pennyblack/cartridge/scripts/pennyblack/OrderToPayloadTransformer');
var OrderWebhook = require('int_pennyblack/cartridge/scripts/pennyblack/OrderWebhook');
var OrderWebhookQueue = require('int_pennyblack/cartridge/scripts/pennyblack/OrderWebhookQueue');

var MS_IN_SECOND = 1000;

function OrderWebhookJob() {
  this._logger = Logger.getLogger('PennyBlack', 'OrderWebhookJob');
  this._transformer = new OrderToPayloadTransformer();
  this._queue = new OrderWebhookQueue();
  this._apiKey = Config.get('apiKey');
}

OrderWebhookJob.prototype._endpoints = {
  production: 'https://api.pennyblack.io/ingest/order',
  test: 'https://api.test.pennyblack.io/ingest/order',
};

OrderWebhookJob.prototype.execute = function () {
  if (!Config.get('enabled')) {
    return;
  }

  if (!this._apiKey) {
    this._logger.error('apiKey missing from site preferences');
    return;
  }

  this._processQueue();
};

OrderWebhookJob.prototype._processQueue = function () {
  var entry;
  while ((entry = this._queue.pop())) {
    this._logger.info('processing queue entry for order {0}', entry.custom.order);
    this._sendWebhook(entry);
  }
};

OrderWebhookJob.prototype._sendWebhook = function (entry) {
  var payload = this._orderToPayload(entry.custom.order);
  if (payload === null) {
    this._updateEntry(entry, OrderWebhook.Status.ERROR, 0, 'sfcc internal error whilst constructing payload');
    return;
  }

  var client = new HTTPClient();
  client.open('POST', this._endpoints[Config.get('mode')]);
  client.setTimeout(10 * MS_IN_SECOND);
  client.setRequestHeader('Content-Type', 'application/json');
  client.setRequestHeader('X-Api-Key', this._apiKey);
  client.send(JSON.stringify(payload));

  this._updateEntry(
    entry,
    client.statusCode == 202 ? OrderWebhook.Status.SUCCESS : OrderWebhook.Status.ERROR,
    client.statusCode,
    client.text,
  );
};

OrderWebhookJob.prototype._updateEntry = function (entry, status, code, message) {
  Transaction.wrap(function () {
    entry.custom.status = status;
    entry.custom.response_code = code;
    entry.custom.response_message = message;
  });
};

OrderWebhookJob.prototype._orderToPayload = function (orderNo) {
  var order = OrderMgr.getOrder(orderNo);
  if (order === null) {
    this._logger.warn('entry with orderNo {0} could not be resolved to an actual order', orderNo);
    return null;
  }
  return this._transformer.transform(OrderMgr.getOrder(orderNo));
};

module.exports = {
  execute: function () {
    new OrderWebhookJob().execute();
  },
};
