import LogFactory from './log';


describe('log', () => {
  it('should create unique instances', () => {
    const headingA = 'labelA';
    const instanceA = LogFactory(headingA);

    jest.resetModules();

    const headingB = 'labelB';
    const instanceB = LogFactory(headingB);

    expect(instanceA).not.toEqual(instanceB);
    expect(instanceA.heading).not.toBe(instanceB.heading);
    expect(instanceB.heading).not.toBe(instanceA.heading);
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
        expect(logger.level).toBe(LOG_LEVEL);
      });
    });

    describe('and is not a valid log level', () => {
      it('should do nothing', () => {
        const LOG_LEVEL = 'foo';
        process.env.LOG_LEVEL = LOG_LEVEL;

        const logger = LogFactory('');
        expect(logger.level).not.toBe(LOG_LEVEL);
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

        expect(logger.level).toBe(LOG_LEVEL);
      });
    });

    describe('that is not a valid log level', () => {
      it('should throw an error', () => {
        const LOG_LEVEL = 'foo';

        expect(() => {
          LogFactory('', LOG_LEVEL);
        }).toThrow(`Unsupported log level: "${LOG_LEVEL}".`);
      });
    });
  });

  describe('when provided an Error', () => {
    const logLevel = 'foo';
    const logMethodSpy = jest.fn();

    beforeEach(() => {
      jest.doMock('npmlog', () => {
        return {
          levels: {
            [logLevel]: true
          },
          [logLevel]: logMethodSpy
        };
      });
    });

    it('should only log its stack', () => {
      const LogFactory = require('./log'); // tslint:disable-line no-require-imports no-shadowed-variable
      const logger = LogFactory('');
      const err = new Error();
      logger[logLevel]('prefix', err);
      expect(logMethodSpy.mock.calls[0][1]).toBe(err.stack);
    });
  });
});
