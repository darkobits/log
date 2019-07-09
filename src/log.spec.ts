import stripColor from 'strip-color';
import uuid from 'uuid/v4';
import LogFactory from './log';


/**
 * Provided a Jest spy and an optional call index, returns the list of arguments
 * passed to that call with any color codes stripped from any string arguments.
 */
function cleanArguments(spy: jest.SpyInstance, call = 0) {
  const args = spy.mock.calls[call];

  return args.map((arg: any) => {
    if (typeof arg === 'string') {
      return stripColor(arg);
    }

    return arg;
  });
}


describe('Log', () => {
  const heading = 'HEADING';
  const prefix = uuid();
  const message = uuid();

  let consoleErrorSpy: jest.SpyInstance<void, [any?, ...Array<any>]>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockReturnValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parsing options', () => {
    test('setting a heading', () => {
      const log = LogFactory({heading});

      log.info('prefix', 'message');
      expect(cleanArguments(consoleErrorSpy)[0]).toBe(heading);
    });

    test('setting a level', () => {
      const log = LogFactory({level: 'error'});

      log.info(prefix, message);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);

      log.error(prefix, message);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    test('styling the heading', () => {
      const fg = 'green';
      const bg = 'blue';

      const log = LogFactory({
        heading,
        style: {heading: {fg, bg}}
      });

      log.info(prefix, message);

      const actualHeading = consoleErrorSpy.mock.calls[0][0];
      const expectedHeading = log.chalk.keyword(fg).bgKeyword(bg)(heading);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(actualHeading).toEqual(expectedHeading);
    });

    test('styling the prefix', () => {
      const fg = 'red';
      const bg = 'orange';

      const log = LogFactory({
        heading,
        style: {prefix: {fg, bg}}
      });

      log.info(prefix, message);

      const actualPrefix = consoleErrorSpy.mock.calls[0][2];
      const expectedPrefix = log.chalk.keyword(fg).bgKeyword(bg)(prefix);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(actualPrefix).toEqual(expectedPrefix);
    });

    test('setting Chalk options', () => {
      const log = LogFactory({
        chalk: {
          enabled: false,
          level: 3
        }
      });

      expect(log.chalk.enabled).toBe(false);
      expect(log.chalk.level).toBe(3);
    });
  });

  describe('#getLevel', () => {
    it('should return the current level', () => {
      const log = LogFactory({level: 'error'});
      const {name} = log.getLevel();
      expect(name).toBe('error');
    });
  });

  describe('#getLevels', () => {
    it('should return a map of all levels', () => {
      const log = LogFactory();

      const levels = log.getLevels();

      Object.entries(levels).forEach(([name, level]) => {
        expect(typeof name).toBe('string');
        expect(typeof level).toBe('number');
      });
    });
  });

  describe('#setLevel', () => {
    const log = LogFactory({level: 'error'});

    describe('when provided a valid level', () => {
      it('should set the log level', () => {
        expect(log.getLevel().name).toBe('error');
        log.setLevel('info');
        expect(log.getLevel().name).toBe('info');
      });
    });

    describe('when provided an invalid level', () => {
      it('should throw an error', () => {
        expect(() => {
          log.setLevel(uuid());
        }).toThrow('Invalid log level');
      });
    });
  });

  describe('#isLevelAtLeast', () => {
    describe('when passed `silent`', () => {
      it('should return `false`', () => {
        const log = LogFactory();
        expect(log.isLevelAtLeast('silent')).toBe(false);
      });
    });

    describe('when provided a valid log level', () => {
      const log = LogFactory({level: 'info'});

      it('should return `true` if a message at the provided level would be logged', () => {
        expect(log.isLevelAtLeast('verbose')).toBe(false);
      });

      it('should return `false` if a message at the provided level would not be logged', () => {
        expect(log.isLevelAtLeast('error')).toBe(true);
      });
    });

    describe('when provided an invalid level', () => {
      it('should throw an error', () => {
        const log = LogFactory();
        expect(() => {
          log.isLevelAtLeast(uuid());
        }).toThrow('Invalid log level');
      });
    });
  });

  describe('#setHeading', () => {
    const log = LogFactory({heading});

    describe('when provided `undefined`', () => {
      it('should set the heading to an empty string', () => {
        log.info(prefix, message);
        expect(cleanArguments(consoleErrorSpy)[0]).toBe(heading);

        log.setHeading('');
        log.info(prefix, message);
        expect(cleanArguments(consoleErrorSpy)[1]).toBe('info');
      });
    });

    describe('when provided a non-string', () => {
      it('should throw an error', () => {
        expect(() => {
          // @ts-ignore
          log.setHeading({});
        }).toThrow('Expected type of "heading" to be "string"');
      });
    });

    describe('when provided a string', () => {
      it('should set the heading to the provided string', () => {
        const newHeading = uuid();
        log.setHeading(newHeading);
        log.info(prefix, message);
        expect(cleanArguments(consoleErrorSpy)[0]).toBe(newHeading);
      });
    });

    describe('when provided a style object', () => {
      it('should apply the provided style', () => {
        const fg = 'red';
        const bg = 'purple';

        log.setHeading(heading, {fg, bg});
        log.info(prefix, message);

        const actualHeading = consoleErrorSpy.mock.calls[0][0];
        const expectedHeading = log.chalk.keyword(fg).bgKeyword(bg)(heading);

        expect(actualHeading).toBe(expectedHeading);
      });
    });
  });

  describe('#addLevel', () => {
    const log = LogFactory({heading});

    describe('when adding a level that already exists', () => {
      it('should throw an error', () => {
        expect(() => {
          // @ts-ignore
          log.addLevel('info', {});
        }).toThrow('already exists');
      });
    });

    describe('when adding a level that matches the name of an existing method/member', () => {
      it('should throw an error', () => {
        expect(() => {
          // @ts-ignore
          log.addLevel('setHeading', {});
        }).toThrow('Invalid log level');
      });
    });

    describe('when adding a level with a non-string label', () => {
      it('should throw an error', () => {
        expect(() => {
          // @ts-ignore
          log.addLevel('wonky', {label: false, level: 1});
        }).toThrow('Expected type of "label" to be "string"');
      });
    });

    describe('when adding a level with a non-numeric value', () => {
      it('should throw an error', () => {
        expect(() => {
          // @ts-ignore
          log.addLevel('wonky', {label: 'WONK', level: false});
        }).toThrow('Expected type of "level" to be "number"');
      });
    });

    describe('adding a valid level', () => {
      it('should add the provided level', () => {
        const label = uuid();

        log.addLevel('wonky', {label, level: 200});

        // @ts-ignore
        log.wonky(prefix, message);

        expect(cleanArguments(consoleErrorSpy)[1]).toBe(label);
      });
    });
  });

  describe('#updateLevel', () => {
    const log = LogFactory({heading});

    describe('when provided a non-existant level', () => {
      it('should throw an error', () => {
        const invalidLevel = uuid();

        expect(() => {
          // @ts-ignore
          log.updateLevel(invalidLevel, {});
        }).toThrow(`Log level "${invalidLevel}" does not exist.`);
      });
    });

    describe('when provided a valid log level', () => {
      it('should update the log level', () => {
        const newLabel = uuid();
        const fg = {red: 1, green: 1, blue: 1};
        const bg = {red: 1, green: 1, blue: 1};

        log.updateLevel('info', {label: newLabel, style: {fg, bg}});
        log.info(prefix, message);

        const actualLevelLabel = consoleErrorSpy.mock.calls[0][1];
        const expectedLevelLabel = log.chalk.rgb(fg.red, fg.green, fg.blue).bgRgb(bg.red, bg.green, bg.blue)(newLabel);

        expect(actualLevelLabel).toBe(expectedLevelLabel);
      });
    });
  });
});
