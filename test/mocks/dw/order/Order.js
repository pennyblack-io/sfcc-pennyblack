const Customer = require("../customer/Customer");
const Collection = require("../util/Collection");

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
    }

    getCustomer() {
        return new Customer(this.customer);
    }

    getCustomerEmail() {
        return this.customer.email;
    }

    getProductLineItems() {
        return new Collection(this.productLineItems);
    }
}

module.exports = Order;
