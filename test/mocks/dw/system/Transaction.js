/**
 * Fake Transaction
 *
 * Very simplisitic implementation providing just enough functionality to drive our tests.
 */
class Transaction {
  constructor() {}
  wrap(tx) {
    tx();
  }
}

module.exports = Transaction;
