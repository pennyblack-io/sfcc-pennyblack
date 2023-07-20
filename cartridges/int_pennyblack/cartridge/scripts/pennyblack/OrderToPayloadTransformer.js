var Locale = require('dw/util/Locale');

function OrderToPayloadTransformer() {}

OrderToPayloadTransformer.prototype.transform = function (order) {
  this._order = order;
  this._customer = order.customer;
  this._isGuest = this._customer && this._customer.anonymous;
  return this._buildPayload();
};

OrderToPayloadTransformer.prototype._buildPayload = function () {
  return {
    origin: 'sfcc',
    customer: this._buildCustomerData(),
    order: this._buildOrderData(),
  };
};

OrderToPayloadTransformer.prototype._buildCustomerData = function () {
  var customer = {};
  customer.vendor_customer_id = this._customer.ID;
  customer.first_name = this._order.defaultShipment.shippingAddress.firstName;
  customer.last_name = this._order.defaultShipment.shippingAddress.lastName;
  customer.email = this._order.customerEmail;
  customer.language = Locale.getLocale(this._order.customerLocaleID).language;
  customer.total_orders = this._getTotalOrders();
  customer.tags = this._getCustomerGroups();
  customer.total_spent = this._getTotalSpent();
  return customer;
};

OrderToPayloadTransformer.prototype._getTotalOrders = function () {
  if (this._isGuest) {
    return 1;
  }

  return this._customer.orderHistory.orderCount;
};

OrderToPayloadTransformer.prototype._buildOrderData = function () {
  var giftMessages = this._getGiftMessages();
  var { skus, productTitles } = this._getLineItems();
  var couponCodes = this._getCouponCodes();

  var order = {};
  order.id = this._order.orderNo;
  order.number = this._order.orderNo;
  order.created_at = this._order.creationDate.toISOString();
  order.total_amount = this._order.totalGrossPrice.value;
  order.total_items = this._order.productLineItems.length;
  order.billing_country = this._order.billingAddress.countryCode.value;
  order.billing_postcode = this._order.billingAddress.postalCode;
  order.billing_city = this._order.billingAddress.city;
  order.shipping_country = this._order.defaultShipment.shippingAddress.countryCode.value;
  order.shipping_postcode = this._order.defaultShipment.shippingAddress.postalCode;
  order.shipping_city = this._order.defaultShipment.shippingAddress.city;
  order.currency = this._order.currencyCode;
  order.skus = skus;
  order.product_titles = productTitles;
  order.promo_codes = couponCodes;

  if (giftMessages.length > 0) {
    order.gift_message = giftMessages[0];
  }

  return order;
};

OrderToPayloadTransformer.prototype._getGiftMessages = function () {
  var giftMessages = [];
  var shipments = this._order.shipments.iterator();
  while (shipments.hasNext()) {
    var shipment = shipments.next();
    var giftMessage = shipment.giftMessage;
    if (giftMessage) {
      giftMessages.push(giftMessage);
    }
  }
  return giftMessages;
};

OrderToPayloadTransformer.prototype._getCustomerGroups = function () {
  var customerGroups = [];
  if (!this._isGuest) {
    var groupsIterator = this._customer.customerGroups.iterator();
    while (groupsIterator.hasNext()) {
      var group = groupsIterator.next();
      customerGroups.push(group.ID);
    }
  }
  return customerGroups;
};

OrderToPayloadTransformer.prototype._getLineItems = function () {
  var skus = [];
  var productTitles = [];
  var productLineItems = this._order.productLineItems.iterator();
  while (productLineItems.hasNext()) {
    var productLineItem = productLineItems.next();
    skus.push(productLineItem.manufacturerSKU ? productLineItem.manufacturerSKU : productLineItem.productID);
    productTitles.push(productLineItem.productName);
  }

  return { skus, productTitles };
};

OrderToPayloadTransformer.prototype._getCouponCodes = function () {
  var couponCodes = [];
  var couponLineItems = this._order.couponLineItems.iterator();
  while (couponLineItems.hasNext()) {
    var couponLineItem = couponLineItems.next();
    var couponCode = couponLineItem.couponCode;
    if (couponCode) {
      couponCodes.push(couponCode);
    }
  }
  return couponCodes;
};

OrderToPayloadTransformer.prototype._getTotalSpent = function () {
  if (this._isGuest) {
    return this._order.totalGrossPrice.value;
  }

  var totalSpent = 0.0;
  var historicalOrders = this._customer.orderHistory.orders;

  while (historicalOrders.hasNext()) {
    var order = historicalOrders.next();
    totalSpent += order.totalGrossPrice.value;
  }

  return totalSpent;
};

module.exports = OrderToPayloadTransformer;
