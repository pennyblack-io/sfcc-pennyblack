var HTTPClient = require('dw/net/HTTPClient');

var Config = require('int_pennyblack/cartridge/scripts/pennyblack/Config');
var OrderToPayloadTransformer = require('int_pennyblack/cartridge/scripts/pennyblack/OrderToPayloadTransformer');

var OrderWebhookStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error'
}

var OrderWebhookEndpoints = {
  production: 'https://api.pennyblack.io/ingest/order',
  test: 'https://api.test.pennyblack.io/ingest/order',
  debug: 'https://webhook.site/02bee4a1-0cde-4859-8ecb-9ee1cff85ad0',
};

function OrderWebhook() {}

OrderWebhook.prototype.send = function(order, siteId) {
  var client = new HTTPClient();
  var payload = new OrderToPayloadTransformer().transform(order);

  client.open('POST', OrderWebhookEndpoints[Config.get('mode', siteId)]);
  client.setRequestHeader('Content-Type', 'application/json');
  client.setRequestHeader('X-Api-Key', config.get('apiKey', siteId));
  client.send(JSON.stringify(payload));

  if (client.statusCode === 202) {
    return { code: client.statusCode, response: client.text };
  } else {
    return { code: client.statusCode, response: client.errorText };
  }
}

module.exports = {
  OrderWebhook: OrderWebhook,
  OrderWebhookStatus: OrderWebhookStatus
};
