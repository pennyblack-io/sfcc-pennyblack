/**
 * Fake Logger
 *
 * Very simplisitic implementation providing just enough functionality to drive our tests.
 */
class Logger {
  constructor() {}

  getLogger() {
    return new Logger();
  }

  alert() {
    return;
  }

  warn() {
    return;
  }

  info() {
    return;
  }

  debug() {
    return;
  }
}

module.exports = Logger;
