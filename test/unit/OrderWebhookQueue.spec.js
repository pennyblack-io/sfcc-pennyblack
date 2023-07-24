const expect = require('chai').expect;
const proxyquire = require('proxyquire').noCallThru();

const DataLoader = require('../data/DataLoader');

const CustomObjectMgr = require('../mocks/dw/object/CustomObjectMgr');
const Logger = require('../mocks/dw/system/Logger');
const Site = require('../mocks/dw/system/Site');
const Transaction = require('../mocks/dw/system/Transaction');

const OrderWebhook = require('../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderWebhook');

describe('OrderWebhookQueue', function () {
  describe('pop()', function () {
    describe('given: queue is empty', function () {
      const site = new Site();
      const config = proxyquire('../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/Config.js', {
        'dw/system/Site': site,
      });
      const OrderWebhookQueue = proxyquire(
        '../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderWebhookQueue.js',
        {
          'dw/object/CustomObjectMgr': new CustomObjectMgr(DataLoader('queue', 'empty')),
          'dw/system/Logger': new Logger(),
          'dw/system/Site': site,
          'dw/system/Transaction': new Transaction(),
          'int_pennyblack/cartridge/scripts/pennyblack/Config': config,
          'int_pennyblack/cartridge/scripts/pennyblack/OrderWebhook': OrderWebhook,
        },
      );

      it('returns false on first call to pop', function () {
        expect(new OrderWebhookQueue().pop()).to.eq(false);
      });
    });

    describe('given: queue holds two entries which are pending', function () {
      const site = new Site({}, 'UK');
      const config = proxyquire('../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/Config.js', {
        'dw/system/Site': site,
      });
      const OrderWebhookQueue = proxyquire(
        '../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderWebhookQueue.js',
        {
          'dw/object/CustomObjectMgr': new CustomObjectMgr(DataLoader('queue', 'two_entries_both_pending')),
          'dw/system/Logger': new Logger(),
          'dw/system/Site': site,
          'dw/system/Transaction': new Transaction(),
          'int_pennyblack/cartridge/scripts/pennyblack/Config': config,
          'int_pennyblack/cartridge/scripts/pennyblack/OrderWebhook': OrderWebhook,
        },
      );

      it('returns both entries then false', function () {
        let queue = new OrderWebhookQueue();
        expect(queue.pop().custom.order).to.eq('0001');
        expect(queue.pop().custom.order).to.eq('0002');
        expect(queue.pop()).to.eq(false);
      });
    });

    describe('given: queue holds mix of sites and states', function () {
      const site = new Site({});
      const config = proxyquire('../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/Config.js', {
        'dw/system/Site': site,
      });
      const OrderWebhookQueue = proxyquire(
        '../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderWebhookQueue.js',
        {
          'dw/object/CustomObjectMgr': new CustomObjectMgr(DataLoader('queue', 'mix_of_sites_and_states')),
          'dw/system/Logger': new Logger(),
          'dw/system/Site': site,
          'dw/system/Transaction': new Transaction(),
          'int_pennyblack/cartridge/scripts/pennyblack/Config': config,
          'int_pennyblack/cartridge/scripts/pennyblack/OrderWebhook': OrderWebhook,
        },
      );

      it('returns two pending entries for UK', function () {
        site._id = 'UK';
        let queue = new OrderWebhookQueue();
        let entry1 = queue.pop();
        let entry2 = queue.pop();
        expect(entry1.custom.order).to.eq('0004');
        expect(entry1.custom.status).to.eq('pending');
        expect(entry2.custom.order).to.eq('0005');
        expect(entry2.custom.status).to.eq('pending');
        expect(queue.pop()).to.eq(false);
      });

      it('returns no entries for ES', function () {
        site._id = 'ES';
        expect(new OrderWebhookQueue().pop()).to.eq(false);
      });

      it('returns one entry for US', function () {
        site._id = 'US';
        let queue = new OrderWebhookQueue();
        let entry1 = queue.pop();
        expect(entry1.custom.order).to.eq('0003');
        expect(entry1.custom.status).to.eq('pending');
        expect(queue.pop()).to.eq(false);
      });
    });
  });
  describe('push()', function () {
    describe('given: queue is currently empty and site is enabled', function () {
      const site = new Site({ pennyblack_enabled: true });
      const config = proxyquire('../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/Config.js', {
        'dw/system/Site': site,
      });
      const OrderWebhookQueue = proxyquire(
        '../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderWebhookQueue.js',
        {
          'dw/object/CustomObjectMgr': new CustomObjectMgr(DataLoader('queue', 'empty')),
          'dw/system/Logger': new Logger(),
          'dw/system/Site': site,
          'dw/system/Transaction': new Transaction(),
          'int_pennyblack/cartridge/scripts/pennyblack/Config': config,
          'int_pennyblack/cartridge/scripts/pennyblack/OrderWebhook': OrderWebhook,
        },
      );

      it('adds one item to queue for a given site and order', function () {
        site._id = 'UK';
        let queue = new OrderWebhookQueue();
        expect(queue.push({ orderNo: '0010' })).to.eq(true);

        let entry1 = queue.pop();
        expect(entry1.custom.order).to.eq('0010');
        expect(entry1.custom.status).to.eq('pending');
        expect(queue.pop()).to.eq(false);
      });

      it('returns false if the supplied order cannot be validated', function () {
        site._id = 'UK';
        let queue = new OrderWebhookQueue();

        expect(queue.push('0010')).to.eq(false);
        expect(queue.push()).to.eq(false);
        expect(queue.push({})).to.eq(false);
        expect(queue.push({ orderNo: 0 })).to.eq(false);
        expect(queue.push({ orderNo: null })).to.eq(false);
        expect(queue.push({ orderNo: '' })).to.eq(false);
      });
    });

    describe('given: queue is currently empty and site is disabled', function () {
      const site = new Site({ pennyblack_enabled: false });
      const config = proxyquire('../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/Config.js', {
        'dw/system/Site': site,
      });
      const OrderWebhookQueue = proxyquire(
        '../../cartridges/int_pennyblack/cartridge/scripts/pennyblack/OrderWebhookQueue.js',
        {
          'dw/object/CustomObjectMgr': new CustomObjectMgr(DataLoader('queue', 'empty')),
          'dw/system/Logger': new Logger(),
          'dw/system/Site': site,
          'dw/system/Transaction': new Transaction(),
          'int_pennyblack/cartridge/scripts/pennyblack/Config': config,
          'int_pennyblack/cartridge/scripts/pennyblack/OrderWebhook': OrderWebhook,
        },
      );

      it('returns false even when order is valid', function () {
        site._id = 'UK';
        let queue = new OrderWebhookQueue();
        expect(queue.push({ orderNo: '0010' })).to.eq(false);
      });
    });
  });
});
