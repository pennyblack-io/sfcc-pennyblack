var Logger = require('dw/system/Logger');
var server = require('server');
var base = module.superModule;
var OrderMgr = require('dw/order/OrderMgr');
var OrderWebhookQueue = require('*/cartridge/scripts/pennyblack/OrderWebhookQueue');

server.extend(base);
server.append('Confirm', function (req, res, next) {
  Logger.info('pennyblack: intercepting order confirmation');
  var order = OrderMgr.getOrder(req.form.orderID, req.form.orderToken);
  (new OrderWebhookQueue()).push(order);
  return next();
});

module.exports = server.exports();
