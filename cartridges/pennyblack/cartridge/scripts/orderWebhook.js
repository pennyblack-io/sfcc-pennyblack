var HTTPClient = require('dw/net/HTTPClient');
var Locale = require('dw/util/Locale');
var Logger = require('dw/system/Logger');

function sendOrderWebhook(order) {
    var client = new HTTPClient();
    var url = 'https://api.test.pennyblack.io/ingest/order';
    var apiKey = '';
    var payload = (new OrderToPayloadTransformer()).transform(order);

    client.open('POST', url);
    client.setRequestHeader('Content-Type', 'application/json');
    client.setRequestHeader('X-Api-Key', apiKey);
    client.send(JSON.stringify(payload));

    if (client.statusCode === 202) {
        Logger.info('pennyblack order ingest success for order: {0}', order.getUUID());
    } else {
        Logger.error('pennyblack order ingest failed for order: {0}. Status Code: {1}, Error Text: {2}', order.getUUID(), client.statusCode, client.getErrorText());
    }
}

function OrderToPayloadTransformer() { }

OrderToPayloadTransformer.prototype.transform = function (order) {
    this._order = order;
    this._customer = order.getCustomer();
    this._isGuest = (this._customer && this._customer.isAnonymous());
    return this._buildPayload();
}

OrderToPayloadTransformer.prototype._buildPayload = function () {
    return {
        origin: 'sfcc',
        customer: this._buildCustomerData(),
        order: this._buildOrderData()
    };
}

OrderToPayloadTransformer.prototype._buildCustomerData = function () {
    var { firstName, lastName } = this._getName();

    var customer = {};
    customer.vendor_customer_id = this._customer.ID;
    customer.first_name = firstName;
    customer.last_name = lastName;
    customer.email = this._order.getCustomerEmail();
    customer.language = Locale.getLocale(this._order.customerLocaleID).getLanguage();
    customer.total_orders = this._order.customer.orderHistory.orderCount + 1;
    customer.tags = this._getCustomerGroups();
    customer.total_spent = this._getTotalSpent();

    return customer;
}

OrderToPayloadTransformer.prototype._buildOrderData = function () {
    var giftMessages = this._getGiftMessages();
    var { skus, product_titles: productTitles } = this._getLineItems();
    var couponCodes = this._getCouponCodes();

    var order = {};
    order.id = this._order.getUUID();
    order.number = this._order.getUUID();
    order.created_at = this._order.getCreationDate().toISOString();
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
}

OrderToPayloadTransformer.prototype._getName = function () {
    var firstName, lastName;
    if (this._isGuest) {
        var billingAddress = this._order.getBillingAddress();
        if (billingAddress) {
            firstName = billingAddress.getFirstName();
            lastName = billingAddress.getLastName();
        }
    } else {
        firstName = this._customer.getProfile().getFirstName();
        lastName = this._customer.getProfile().getLastName();
    }
    return { firstName, lastName };
}

OrderToPayloadTransformer.prototype._getGiftMessages = function () {
    var giftMessages = [];
    var shipments = this._order.getShipments().iterator();
    while (shipments.hasNext()) {
        var shipment = shipments.next();
        var giftMessage = shipment.getGiftMessage();
        if (giftMessage) {
            giftMessages.push(giftMessage);
        }
    }
    return giftMessages;
}

OrderToPayloadTransformer.prototype._getCustomerGroups = function () {
    var customerGroups = [];
    if (!this._isGuest) {
        var groupsIterator = this._customer.getCustomerGroups().iterator();
        while (groupsIterator.hasNext()) {
            var group = groupsIterator.next();
            customerGroups.push(group.getID());
        }
    }
    return customerGroups;
}

OrderToPayloadTransformer.prototype._getLineItems = function () {
    var skus = [];
    var productTitles = [];
    var productLineItems = this._order.getProductLineItems().iterator();
    while (productLineItems.hasNext()) {
        var productLineItem = productLineItems.next();
        skus.push(productLineItem.getManufacturerSKU());
        productTitles.push(productLineItem.getProductName());
    }
    return { skus, productTitles: productTitles };
}

OrderToPayloadTransformer.prototype._getCouponCodes = function () {
    var couponCodes = [];
    var couponLineItems = this._order.getCouponLineItems().iterator();
    while (couponLineItems.hasNext()) {
        var couponLineItem = couponLineItems.next();
        var couponCode = couponLineItem.getCouponCode();
        if (couponCode) {
            couponCodes.push(couponCode);
        }
    }
    return couponCodes;
}

OrderToPayloadTransformer.prototype._getTotalSpent = function () {
    var totalSpent = 0.0;
    if (!this._isGuest) {
        var start = 0;
        var pageSize = 50;
        var orders;

        do {
            orders = OrderMgr.searchOrders("customerNo = {0}", "-creationDate", this._customer.getCustomerNo());
            orders.setStart(start);
            orders.setPageSize(pageSize);

            while (orders.hasNext()) {
                var pastOrder = orders.next();
                totalSpent += pastOrder.getTotalGrossPrice().value;
            }

            start += pageSize;
        } while (orders.getCount() > start);
    }

    totalSpent += this._order.getTotalGrossPrice().value;

    return totalSpent;
}

module.exports = {
    sendOrderWebhook: sendOrderWebhook
};
