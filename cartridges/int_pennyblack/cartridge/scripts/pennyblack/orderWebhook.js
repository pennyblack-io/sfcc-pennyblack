var HTTPClient = require('dw/net/HTTPClient');
var Logger = require('dw/system/Logger');

var config = require('*/cartridge/scripts/pennyblack/config');
var OrderToPayloadTransformer = require('*/cartridge/scripts/pennyblack/OrderToPayloadTransformer');

function sendOrderWebhook(order) {
  var client = new HTTPClient();
  var url = 'https://api.test.pennyblack.io/ingest/order';
  var payload = new OrderToPayloadTransformer().transform(order);

  client.open('POST', url);
  client.setRequestHeader('Content-Type', 'application/json');
  client.setRequestHeader('X-Api-Key', config.apiKey);
  client.send(JSON.stringify(payload));

  if (client.statusCode === 202) {
    Logger.info('pennyblack order ingest success for order: {0}', order.getUUID());
  } else {
    Logger.error(
      'pennyblack order ingest failed for order: {0}. Status Code: {1}, Error Text: {2}',
      order.getUUID(),
      client.statusCode,
      client.getErrorText(),
    );
  }
}

module.exports = {
  sendOrderWebhook: sendOrderWebhook,
};
