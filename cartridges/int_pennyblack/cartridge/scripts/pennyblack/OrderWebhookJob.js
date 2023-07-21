var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');

var { OrderWebhook, OrderWebhookStatus } = require('int_pennyblack/cartridge/scripts/pennyblack/OrderWebhook');
var OrderWebhookQueue = require('int_pennyblack/cartridge/scripts/pennyblack/OrderWebhookQueue');

function OrderWebhookJob() {}

OrderWebhookJob.prototype.execute = function() {
    var queue = new OrderWebhookQueue();
    var webhook = new OrderWebhook();
    var entry;
    while (entry = queue.pop()) {
        var order = this._loadOrder(entry.custom.order);
        var { code, response } = webhook.send(order, entry.site);
        Transaction.wrap(function () {
            entry.status = (code == 201) ? OrderWebhookStatus.SUCCESS : OrderWebhookStatus.ERROR;
            entry.response_code = code;
            entry.response_message = response;
        });
    }
}

OrderWebhookJob.prototype._loadOrder = function(orderNo) {
    return OrderMgr.getOrder(orderNo);
}

module.exports = { execute: (new OrderWebhookJob()).execute };
