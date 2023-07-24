var Logger = require('dw/system/Logger');
var server = require('server');
var base = module.superModule;
var OrderMgr = require('dw/order/OrderMgr');

var OrderWebhookQueue = require('*/cartridge/scripts/pennyblack/OrderWebhookQueue');

server.extend(base);
server.append('Confirm', function (req, res, next) {
  new OrderWebhookQueue().push(OrderMgr.getOrder(req.form.orderID, req.form.orderToken));
  return next();
});

module.exports = server.exports();
