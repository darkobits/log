// @ts-ignore
import {expect} from 'chai';
import mock from 'mock-require';
import sinon from 'sinon';
import LogFactory from './log';



describe('log', () => {
  it('should create unique instances', () => {
    const headingA = 'labelA';
    const instanceA = LogFactory(headingA);

    const headingB = 'labelB';
    const instanceB = LogFactory(headingB);

    expect(instanceA).not.equal(instanceB);
    expect(instanceA.heading).not.equal(headingB);
    expect(instanceB.heading).not.equal(headingA);
  });

  describe('when LOG_LEVEL is set', () => {
    let PRIOR_LOG_LEVEL: string | undefined;

    beforeEach(() => {
      PRIOR_LOG_LEVEL = process.env.LOG_LEVEL;
    });

    describe('and is a valid log level', () => {
      it('should set the log level to LOG_LEVEL', () => {
        const LOG_LEVEL = 'error';
        process.env.LOG_LEVEL = LOG_LEVEL;

        const logger = LogFactory('');
        expect(logger.level).to.equal(LOG_LEVEL);
      });
    });

    describe('and is not a valid log level', () => {
      it('should do nothing', () => {
        const LOG_LEVEL = 'foo';
        process.env.LOG_LEVEL = LOG_LEVEL;

        const logger = LogFactory('');
        expect(logger.level).not.to.equal(LOG_LEVEL);
      });
    });

    afterEach(() => {
      process.env.LOG_LEVEL = PRIOR_LOG_LEVEL;
    });
  });

  describe('when a level argument is provided', () => {
    describe('that is a valid log level', () => {
      it('should set the log level to LOG_LEVEL', () => {
        const LOG_LEVEL = 'error';
        const logger = LogFactory('', LOG_LEVEL);

        expect(logger.level).to.equal(LOG_LEVEL);
      });
    });

    describe('that is not a valid log level', () => {
      it('should throw an error', () => {
        const LOG_LEVEL = 'foo';

        expect(() => {
          LogFactory('', LOG_LEVEL);
        }).to.throw(`Unsupported log level: "${LOG_LEVEL}".`);
      });
    });
  });

  describe('when provided an Error', () => {
    it('should only log its stack', () => {
      const logLevel = 'foo';
      const logMethodSpy = sinon.spy();

      const npmlogMock = {
        levels: {
          [logLevel]: true
        },
        [logLevel]: logMethodSpy
      };

      mock('npmlog', npmlogMock);

      const LogFactory = require('./log').default;
      const logger = LogFactory('');

      const err = new Error();

      logger[logLevel]('prefix', err);

      expect(logMethodSpy.getCall(0).args[1]).to.equal(err.stack);
    });
  });
});
