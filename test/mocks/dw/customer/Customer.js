/**
 * Fake Customer
 * 
 * Very simplisitic implementation providing just enough functionality to drive our tests.
 */
class Customer {
    constructor(data) {
        Object.assign(this, data);
    }
}

module.exports = Customer;
