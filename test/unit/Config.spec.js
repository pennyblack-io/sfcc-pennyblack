const expect = require('chai').expect;
const proxyquire = require('proxyquire').noCallThru();

const Site = require('../mocks/dw/system/Site');

describe('Config', function () {
  describe('get()', function () {
    describe('given site with no preferences set', function () {
      const Config = proxyquire('../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/Config.js', {
        'dw/system/Site': new Site({}),
      });
      it('provides false for enabled preference', function () {
        expect(Config.get('enabled')).to.eq(false);
      });
      it('provides an empty string for apiKey', function () {
        expect(Config.get('apiKey')).to.eq('');
      });
      it('provides "production" for mode', function () {
        expect(Config.get('mode')).to.eq('production');
      });
    });
    describe('given enabled site in debug mode with an api key', function () {
      const Config = proxyquire('../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/Config.js', {
        'dw/system/Site': new Site({
          pennyblack_enabled: true,
          pennyblack_mode: 'test',
          pennyblack_apiKey: 'test-api-key',
        }),
      });
      it('provides enabled as set in site', function () {
        expect(Config.get('enabled')).to.eq(true);
      });
      it('provides apiKey as set in site', function () {
        expect(Config.get('apiKey')).to.eq('test-api-key');
      });
      it('provides mode as set in site', function () {
        expect(Config.get('mode')).to.eq('test');
      });
    });
  });
});
