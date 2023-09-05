var Locale = require('dw/util/Locale');
var OrderMgr = require('dw/order/OrderMgr');

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
    origin_app_version: '1.0.4',
    customer: this._buildCustomerData(),
    order: this._buildOrderData(),
  };
};

OrderToPayloadTransformer.prototype._buildCustomerData = function () {
  var { totalOrders, totalSpent } = this._getOrderHistory();

  var customer = {};
  customer.vendor_customer_id = this._customer.ID;
  customer.email = this._order.customerEmail;
  customer.total_orders = totalOrders;
  customer.tags = this._getCustomerGroups();
  customer.total_spent = totalSpent;

  if (this._order.defaultShipment.shippingAddress) {
    customer.first_name = this._order.defaultShipment.shippingAddress.firstName;
    customer.last_name = this._order.defaultShipment.shippingAddress.lastName;
  } else {
    customer.first_name = this._order.billingAddress.firstName;
    customer.last_name = this._order.billingAddress.lastName;
  }

  var locale = Locale.getLocale(this._order.customerLocaleID);
  var language = locale ? locale.language : null;

  if (language) {
    customer.language = language;
  }

  return customer;
};

OrderToPayloadTransformer.prototype._buildOrderData = function () {
  var giftMessages = this._getGiftMessages();
  var { skus, productTitles } = this._getLineItems();
  var couponCodes = this._getCouponCodes();

  var order = {};
  order.id = this._order.orderNo;
  order.number = this._order.externalOrderNo !== null ? this._order.externalOrderNo : this._order.orderNo;
  order.created_at = this._order.creationDate.toISOString();
  order.total_amount = this._order.totalGrossPrice.value;
  order.total_items = this._order.productLineItems.length;
  order.currency = this._order.currencyCode;

  if (Array.isArray(skus) && skus.length > 0) {
    order.skus = skus;
  }

  if (Array.isArray(productTitles) && productTitles.length > 0) {
    order.product_titles = productTitles;
  }

  if (Array.isArray(couponCodes) && couponCodes.length > 0) {
    order.promo_codes = couponCodes;
  }

  if ('shippingAddress' in this._order.defaultShipment && this._order.defaultShipment.shippingAddress != null) {
    var shippingAddress = this._order.defaultShipment.shippingAddress;
    if (shippingAddress.countryCode && shippingAddress.countryCode.value) {
      order.shipping_country = shippingAddress.countryCode.value.toUpperCase();
    }
    if (shippingAddress.postalCode) {
      order.shipping_postcode = shippingAddress.postalCode;
    }
    if (shippingAddress.city) {
      order.shipping_city = shippingAddress.city;
    }
  }

  if ('billingAddress' in this._order && this._order.billingAddress != null) {
    var billingAddress = this._order.billingAddress;
    if (billingAddress.countryCode && billingAddress.countryCode.value) {
      order.billing_country = billingAddress.countryCode.value.toUpperCase();
    }
    if (billingAddress.postalCode) {
      order.billing_postcode = billingAddress.postalCode;
    }
    if (billingAddress.city) {
      order.billing_city = billingAddress.city;
    }
  }

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

OrderToPayloadTransformer.prototype._getOrderHistory = function () {
  var orders = OrderMgr.searchOrders(
    'customerEmail = {0} AND creationDate < {1}',
    null,
    this._order.customerEmail,
    this._order.creationDate,
  );

  var totalOrders = orders.count;
  var totalSpent = 0.0;
  var includesCurrentOrder = false;

  while (orders.hasNext()) {
    var order = orders.next();
    totalSpent += order.totalGrossPrice.value;
    if (!includesCurrentOrder && order.orderNo == this._order.orderNo) {
      includesCurrentOrder = true;
    }
  }

  if (!includesCurrentOrder) {
    totalOrders++;
    totalSpent += this._order.totalGrossPrice.value;
  }

  return { totalOrders, totalSpent };
};

module.exports = OrderToPayloadTransformer;
