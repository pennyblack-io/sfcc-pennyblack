var expect = require('chai').expect;
var proxyquire = require('proxyquire').noCallThru();

var DataLoader = require('../data/DataLoader');
var Locale = require('../mocks/dw/util/Locale');
var Order = require('../mocks/dw/order/Order');

describe('OrderToPayloadTransformer', function () {

    var OrderToPayloadTransformer = proxyquire('../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderToPayloadTransformer.js', {
        'dw/util/Locale': Locale
    });

    describe('transform()', function () {

        it('sets the origin to sfcc', function () {
            var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
            expect(payload.origin).to.eq("sfcc");
        });

        describe('scenario: simple guest order', function () {

            it('sets customer.vendor_customer_id to the customer ID associated with the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.customer.vendor_customer_id).to.eq(10);
            });

            it('sets customer.first_name to the first name specified in the shipping address', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.customer.first_name).to.eq("Joe");
            });

            it('sets customer.last_name to the last name specified in the shipping address', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.customer.last_name).to.eq("Bloggs");
            });

            it('sets customer.email to the email associated with the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.customer.email).to.eq("john.doe@example.com");
            });

            it('sets customer.language to the language associated with the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.customer.language).to.eq("en");
            });

            it('sets customer.total_orders to 1', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.customer.total_orders).to.eq(1);
            });

            it('sets customer.tags to be empty', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.customer.tags.length).to.eq(0);
            });

            it('sets customer.total_spent to be the total value of the current order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.customer.total_spent).to.eq(10.05);
            });

            it('sets order.id based on the order no. of the current order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.id).to.eq("1");
            });

            it('sets order.number based on the order no. of the current order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.number).to.eq("1");
            });

            it('sets order.created_at from the current order in the ISO 8601 format', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.created_at).to.eq("2023-07-17T14:15:36.046Z");
            });

            it('sets order.total_amount to the total gross value of the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.total_amount).to.eq(10.05);
            });

            it('sets order.total_items to the total number of items of the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.total_items).to.eq(1);
            });

            it('sets order.billing_country to the country as set in the billing address of the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.billing_country).to.eq('gb');
            });

            it('sets order.billing_postcode to the postcode as set in the billing address of the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.billing_postcode).to.eq('ME1 2DR');
            });

            it('sets order.billing_city to the city as set in the billing address of the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.billing_city).to.eq('London');
            });

            it('sets order.shipping_country to the country as set in the shipping address of the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.shipping_country).to.eq('gb');
            });

            it('sets order.shipping_postcode to the postcode as set in the shipping address of the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.shipping_postcode).to.eq('ME2 2DR');
            });

            it('sets order.shipping_city to the city as set in the shipping address of the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.shipping_city).to.eq('Manchester');
            });

            it('sets order.currency to the currency used during checkout for the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.currency).to.eq("GBP");
            });

            it('sets order.skus to a distinct list of products skus from the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.skus).to.deep.eq(["TEST-001"]);
            });

            it('sets order.product_titles to a distinct list of product titles from the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.product_titles).to.deep.eq(["Test Product 01"]);
            });

            it('sets order.gift_message to the first available gift message from the order', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.gift_message).to.eq("Test gift message 1");
            });

            it('sets order.promo_codes based on the order coupon code', function () {
                var payload = (new OrderToPayloadTransformer()).transform(new Order(DataLoader('order', 'simpleGuestOrder')));
                expect(payload.order.promo_codes).to.deep.eq(["TEST_COUPONG_CODE_01"]);
            });
        });
    });
});
