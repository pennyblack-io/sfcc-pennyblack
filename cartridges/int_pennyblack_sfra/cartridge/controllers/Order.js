var Logger = require('dw/system/Logger');
var server = require('server');
var base = module.superModule;
var orderMgr = require('dw/order/OrderMgr');
var orderWebhook = require('*/cartridge/scripts/pennyblack/orderWebhook');

server.extend(base);
server.append('Confirm', function (req, res, next) {
    Logger.info("pennyblack: intercepting order confirmation");
    var order = orderMgr.getOrder(req.form.orderID, req.form.orderToken);
    orderWebhook.sendOrderWebhook(order);
    return next();
});

module.exports = server.exports();
