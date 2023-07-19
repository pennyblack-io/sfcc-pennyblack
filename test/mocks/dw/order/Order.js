const Collection = require("../util/Collection");
const Iterator = require("../util/Iterator");

/**
 * Fake Order
 * 
 * Very simplisitic implementation providing just enough functionality to drive our tests.
 */
class Order {

    constructor(data) {
        Object.assign(this, data);
        this.creationDate = new Date(this.creationDate);
        this.shipments = new Collection(this.shipments);
        this.couponLineItems = new Collection(this.couponLineItems);
        this.productLineItems = new Collection(this.productLineItems);
        this.customer.customerGroups = new Collection(this.customer.customerGroups);
        this.customer.orderHistory.orders = new Iterator(this.customer.orderHistory.orders);
    }
}

module.exports = Order;
