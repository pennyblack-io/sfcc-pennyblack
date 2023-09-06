const expect = require('chai').expect;
const proxyquire = require('proxyquire').noCallThru();

const DataLoader = require('../data/DataLoader');
const Locale = require('../mocks/dw/util/Locale');
const Order = require('../mocks/dw/order/Order');
const OrderMgr = require('../mocks/dw/order/OrderMgr');
const Collection = require('../mocks/dw/util/Collection');

describe('OrderToPayloadTransformer', function () {
  describe('transform()', function () {
    describe('guest checkout with no previous orders', function () {
      const OrderToPayloadTransformer = proxyquire(
        '../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderToPayloadTransformer.js',
        {
          'dw/util/Locale': Locale,
          'dw/order/OrderMgr': new OrderMgr(DataLoader('order_history', 'guestWithNoHistory')),
        },
      );

      it('sets the origin to sfcc', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.origin).to.eq('sfcc');
      });

      it('sets customer.vendor_customer_id to the customer ID associated with the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.customer.vendor_customer_id).to.eq(10);
      });

      it('sets customer.first_name to the first name specified in the shipping address', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.customer.first_name).to.eq('Joe');
      });

      it('sets customer.last_name to the last name specified in the shipping address', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.customer.last_name).to.eq('Bloggs');
      });

      it('sets customer.email to the email associated with the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.customer.email).to.eq('john.doe@example.com');
      });

      it('sets customer.language to the language associated with the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.customer.language).to.eq('en');
      });

      it('sets customer.total_orders to 1', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.customer.total_orders).to.eq(1);
      });

      it('sets customer.tags to be empty', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.customer.tags.length).to.eq(0);
      });

      it('sets customer.total_spent to be the total value of the current order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.customer.total_spent).to.eq(10.05);
      });

      it('sets order.id based on the order no. of the current order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.id).to.eq('1');
      });

      it('sets order.number based on the external order no. of the current order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.number).to.eq('#1');
      });

      it('sets order.number to the order no. when the external order no. is null', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.externalOrderNo = null;
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect(payload.order.number).to.deep.eq('1');
      });

      it('sets order.created_at from the current order in the ISO 8601 format', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.created_at).to.eq('2023-07-17T14:15:36.046Z');
      });

      it('sets order.total_amount to the total gross value of the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.total_amount).to.eq(10.05);
      });

      it('sets order.total_items to the total number of items of the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.total_items).to.eq(1);
      });

      it('sets order.billing_country to the country as set in the billing address of the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.billing_country).to.eq('GB');
      });

      it('sets order.billing_postcode to the postcode as set in the billing address of the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.billing_postcode).to.eq('ME1 2DR');
      });

      it('sets order.billing_city to the city as set in the billing address of the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.billing_city).to.eq('London');
      });

      it('sets order.shipping_country to the country as set in the shipping address of the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.shipping_country).to.eq('GB');
      });

      it('sets order.shipping_postcode to the postcode as set in the shipping address of the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.shipping_postcode).to.eq('ME2 2DR');
      });

      it('sets order.shipping_city to the city as set in the shipping address of the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.shipping_city).to.eq('Manchester');
      });

      it('sets order.currency to the currency used during checkout for the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.currency).to.eq('GBP');
      });

      it('sets order.skus to a distinct list of products skus from the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.skus).to.deep.eq(['TEST-001']);
      });

      it('falls back to product ID when manufacturer SKU is not specified for a product', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.productLineItems[0].manufacturerSKU = null;
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect(payload.order.skus).to.deep.eq(['001']);
      });

      it('sets order.product_titles to a distinct list of product titles from the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.product_titles).to.deep.eq(['Test Product 01']);
      });

      it('sets order.gift_message to the first available gift message from the order', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.gift_message).to.eq('Test gift message 1');
      });

      it('sets order.promo_codes based on the order coupon code', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.order.promo_codes).to.deep.eq(['TEST_COUPON_CODE_01']);
      });

      it('skips billing address when not set on order', function () {
        // https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_order_Order.html
        //   billingAddress  :  OrderAddress  (Read Only)
        //   The billing address defined for the container. Returns null if no billing address has been created yet.
        let data = DataLoader('order', 'guestWithNoHistory');
        data.billingAddress = null;
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect('billing_country' in payload).to.eq(false);
        expect('billing_postcode' in payload).to.eq(false);
        expect('billing_city' in payload).to.eq(false);
      });

      it('skips language when locale has empty language field', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.customerLocaleID = 'de_DE';
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect('language' in payload.customer).to.eq(false);
      });

      it('falls back to billing address when no shipping address is present', function () {
        let payload = new OrderToPayloadTransformer().transform(
          new Order(DataLoader('order', 'guestWithNoShippingAddress')),
        );
        expect(payload.customer.first_name).to.eq('John');
        expect(payload.customer.last_name).to.eq('Doe');
      });

      it('skips shipping_country when not specified', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.defaultShipment.shippingAddress.countryCode = null;
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect('shipping_country' in payload.order).to.eq(false);
      });

      it('skips shipping_postcode when not specified', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.defaultShipment.shippingAddress.postalCode = null;
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect('shipping_postcode' in payload.order).to.eq(false);
      });

      it('skips shipping_city when not specified', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.defaultShipment.shippingAddress.city = null;
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect('shipping_city' in payload.order).to.eq(false);
      });

      it('skips billing_country when not specified', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.billingAddress.countryCode = null;
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect('billing_country' in payload.order).to.eq(false);
      });

      it('skips billing_postcode when not specified', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.billingAddress.postalCode = null;
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect('billing_postcode' in payload.order).to.eq(false);
      });

      it('skips billing_city when not specified', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.billingAddress.city = null;
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect('billing_city' in payload.order).to.eq(false);
      });

      it('skips skus when not specified', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.productLineItems = new Collection([]);
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect('skus' in payload.order).to.eq(false);
      });

      it('skips product_titles when not specified', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.productLineItems = new Collection([]);
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect('product_titles' in payload.order).to.eq(false);
      });

      it('skips promo_codes when not specified', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.couponLineItems = new Collection([]);
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect('promo_codes' in payload.order).to.eq(false);
      });

      it('uses empty string for name when shipping address name is null', function () {
        let data = DataLoader('order', 'guestWithNoHistory');
        data.defaultShipment.shippingAddress.firstName = null;
        data.defaultShipment.shippingAddress.lastName = null;
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect(payload.customer.first_name).to.eq('');
        expect(typeof payload.customer.first_name).to.eq('string');
        expect(payload.customer.last_name).to.eq('');
        expect(typeof payload.customer.last_name).to.eq('string');
      });

      it('uses empty string for name when billing address name is null', function () {
        let data = DataLoader('order', 'guestWithNoShippingAddress');
        data.billingAddress.firstName = null;
        data.billingAddress.lastName = null;
        let payload = new OrderToPayloadTransformer().transform(new Order(data));
        expect(payload.customer.first_name).to.eq('');
        expect(typeof payload.customer.first_name).to.eq('string');
        expect(payload.customer.last_name).to.eq('');
        expect(typeof payload.customer.last_name).to.eq('string');
      });
    });

    describe('guest with previous orders', function () {
      const OrderToPayloadTransformer = proxyquire(
        '../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderToPayloadTransformer.js',
        {
          'dw/util/Locale': Locale,
          'dw/order/OrderMgr': new OrderMgr(DataLoader('order_history', 'guestWithHistory')),
        },
      );

      it('sets customer.total_spent to the total gross value of all placed orders', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithHistory')));
        expect(payload.customer.total_spent).to.eq(45.55);
      });

      it('sets customer.total_orders to count of all orders', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithHistory')));
        expect(payload.customer.total_orders).to.eq(3);
      });
    });

    describe('guest where order is not yet indexed', function () {
      const OrderToPayloadTransformer = proxyquire(
        '../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderToPayloadTransformer.js',
        {
          'dw/util/Locale': Locale,
          'dw/order/OrderMgr': new OrderMgr(DataLoader('order_history', 'empty')),
        },
      );

      it('sets customer.total_spent to the total gross value of all placed orders', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.customer.total_spent).to.eq(10.05);
      });

      it('sets customer.total_orders to count of all orders', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'guestWithNoHistory')));
        expect(payload.customer.total_orders).to.eq(1);
      });
    });

    describe('member with no previous orders', function () {
      const OrderToPayloadTransformer = proxyquire(
        '../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderToPayloadTransformer.js',
        {
          'dw/util/Locale': Locale,
          'dw/order/OrderMgr': new OrderMgr(DataLoader('order_history', 'memberWithNoHistory')),
        },
      );

      it('sets customer.tags to customer groups', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'memberWithNoHistory')));
        expect(payload.customer.tags).to.deep.eq(['Everyone', 'Registered']);
      });

      it('sets customer.total_spent to the total gross value of all placed orders', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'memberWithNoHistory')));
        expect(payload.customer.total_spent).to.eq(10.05);
      });

      it('sets customer.total_orders to count of all orders', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'memberWithNoHistory')));
        expect(payload.customer.total_orders).to.eq(1);
      });
    });

    describe('member with previous orders', function () {
      const OrderToPayloadTransformer = proxyquire(
        '../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderToPayloadTransformer.js',
        {
          'dw/util/Locale': Locale,
          'dw/order/OrderMgr': new OrderMgr(DataLoader('order_history', 'memberWithHistory')),
        },
      );

      it('sets customer.total_spent to the total gross value of all placed orders', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'memberWithHistory')));
        expect(payload.customer.total_spent).to.eq(136.59);
      });

      it('sets customer.total_orders to count of all orders', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'memberWithHistory')));
        expect(payload.customer.total_orders).to.eq(4);
      });
    });

    describe('member where order is not yet indexed', function () {
      const OrderToPayloadTransformer = proxyquire(
        '../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderToPayloadTransformer.js',
        {
          'dw/util/Locale': Locale,
          'dw/order/OrderMgr': new OrderMgr(DataLoader('order_history', 'empty')),
        },
      );

      it('sets customer.total_spent to the total gross value of all placed orders', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'memberWithNoHistory')));
        expect(payload.customer.total_spent).to.eq(10.05);
      });

      it('sets customer.total_orders to count of all orders', function () {
        let payload = new OrderToPayloadTransformer().transform(new Order(DataLoader('order', 'memberWithNoHistory')));
        expect(payload.customer.total_orders).to.eq(1);
      });
    });

    describe('member where order being processed is not the most recent in the order history', function () {
      const OrderToPayloadTransformer = proxyquire(
        '../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderToPayloadTransformer.js',
        {
          'dw/util/Locale': Locale,
          'dw/order/OrderMgr': new OrderMgr(DataLoader('order_history', 'memberWithHistory')),
        },
      );

      it('sets customer.total_spent to the total gross value of all placed orders relative to the history of the current order', function () {
        let payload = new OrderToPayloadTransformer().transform(
          new Order(DataLoader('order', 'memberWithFutureHistory')),
        );
        expect(payload.customer.total_spent).to.eq(121.59);
      });

      it('sets customer.total_orders to count of all placed orders relative to the history of the current order', function () {
        let payload = new OrderToPayloadTransformer().transform(
          new Order(DataLoader('order', 'memberWithFutureHistory')),
        );
        expect(payload.customer.total_orders).to.eq(3);
      });
    });
  });
});
