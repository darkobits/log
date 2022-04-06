import streams from 'stream';

import {v4 as uuid} from 'uuid';

import DEFAULT_CONFIG from 'etc/config';
import {IS_PREFIX} from 'etc/constants';
import {Logger} from 'etc/types';
import LogPipe from 'lib/log-pipe';

import LogFactory from './log';


jest.mock('lib/timer', () => {
  return () => {
    return 'TIMER';
  };
});


jest.mock('lib/progress-bar', () => {
  return () => {
    return 'PROGRESS_BAR';
  };
});


jest.mock('lib/spinner', () => {
  return () => {
    return 'SPINNER';
  };
});


describe('Log', () => {
  let log: Logger;

  const writeSpy = jest.fn((chunk, encoding, cb) => {
    // const str = Buffer.from(chunk).toString('utf8');
    // console.warn('SPY WRITE', str);
    cb();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    log = LogFactory({
      stream: new streams.Writable({
        write: writeSpy
      })
    });
  });

  describe('#getLevel', () => {
    it('should return a LevelDescriptor for the current log level', () => {
      log.configure({level: 'info'});
      expect(log.getLevel().label).toBe('info');
    });
  });

  describe('#getLevels', () => {
    it('should return an object containing all log levels', () => {
      // @ts-ignore
      expect(Object.keys(log.getLevels())).toMatchObject(Object.keys(DEFAULT_CONFIG.levels));
    });
  });

  describe('#isLevelAtLeast', () => {
    beforeEach(() => {
      log.configure({level: 'warn'});
    });

    it('should return true when the configured level would allow logging at the provided level', () => {
      expect(log.isLevelAtLeast('error')).toBe(true);
    });

    it('should return false when the configured level would prevent logging at the provided level', () => {
      expect(log.isLevelAtLeast('info')).toBe(false);
    });

    describe('providing an invalid log level', () => {
      it('should throw an error', () => {
        expect(() => {
          log.isLevelAtLeast('foo');
        }).toThrow('Invalid log level');
      });
    });
  });

  describe('#configure', () => {
    it('should merge the provided configuration object with existing configuration', () => {
      // Todo
    });

    describe('adding levels', () => {
      it('should update log level methods', () => {
        log.configure({
          levels: {
            foo: {
              label: 'FOO',
              level: 4000
            }
          }
        });

        log.configure({level: 'foo'});

        // @ts-ignore
        log.foo('message');

        expect(writeSpy).toHaveBeenCalledTimes(1);
      });

      describe('when passing invalid configuration', () => {
        it('should throw an error', () => {
          expect(() => {
            // @ts-ignore
            log.configure({levels: false});
          }).toThrow('Expected `levels` to be of type `object`');

          expect(() => {
            // @ts-ignore
            log.configure({levels: {
              newLevel: {
                level: 100,
                // @ts-expect-error
                label: false
              }
            }});
          }).toThrow('Expected `label` to be of type `string`');

          expect(() => {
            // @ts-ignore
            log.configure({levels: {
              newLevel: {
                // @ts-expect-error
                level: false,
                label: 'newLevel'
              }
            }});
          }).toThrow('Expected `level` to be of type `number`');
        });
      });
    });
  });

  describe('#prefix', () => {
    describe('when there is no configured prefix style', () => {
      it('should return an unstyled prefix object', () => {
        log.configure({
          // @ts-expect-error
          style: {prefix: undefined}
        });

        const result = log.prefix('prefix');

        expect(result[IS_PREFIX]).toBe(true);
        expect(result.toString()).toBe('prefix');
      });
    });

    describe('when there is a configured prefix style', () => {
      it('should return a styled prefix token', () => {
        const style = uuid();

        log.configure({
          style: {
            prefix: token => `${style}${token}${style}`
          }
        });

        const result = log.prefix('prefix');

        expect(result[IS_PREFIX]).toBe(true);
        expect(result.toString()).toBe(`${style}prefix${style}`);
      });
    });
  });

  describe('#beginInteractive', () => {
    it('should begin an interactive session', () => {
      const messageFn = jest.fn();
      const endInteractive = log.beginInteractive({message: messageFn});
      expect(messageFn).toHaveBeenCalled();

      const endMessageFn = jest.fn();
      endInteractive({message: endMessageFn});
      expect(endMessageFn).toHaveBeenCalled();
    });
  });

  describe('#createTimer', () => {
    it('should return a timer', () => {
      expect(log.createTimer()).toBe('TIMER');
    });
  });

  describe('#createProgressBar', () => {
    it('should return a progress bar', () => {
      expect(log.createProgressBar({getProgress: jest.fn()})).toBe('PROGRESS_BAR');
    });
  });

  describe('#createSpinner', () => {
    it('should return a spinner', () => {
      expect(log.createSpinner()).toBe('SPINNER');
    });
  });

  describe('#createPipe', () => {
    it('should return a LogPipe', () => {
      expect(log.createPipe('info')).toBeInstanceOf(LogPipe);
    });
  });

  describe('#addSecret', () => {
    it('should mask known secrets using the provided mask character', () => {
      const message = 'Shall I compare thee to a summer\'s day? Thou art more lovely and more temperate';

      log.info(message);

      expect(writeSpy.mock.calls[0][0].toString().includes(message)).toBe(true);

      log.addSecret('thee');

      log.info(message);

      const expected = 'Shall I compare **** to a summer\'s day? Thou art more lovely and more temperate';

      expect(writeSpy.mock.calls[1][0].toString().includes(expected)).toBe(true);
    });
  });

  describe('logging messages', () => {
    // @ts-ignore
    Object.entries(DEFAULT_CONFIG.levels).forEach(([level]) => {
      if (level === 'silent') {
        return;
      }

      it(`should expose a "${level}" method`, () => {
        log.configure({level});
        const message = uuid();
        // @ts-ignore
        log[level](level === 'error' ? message : new Error(message));
        expect(writeSpy.mock.calls[0][0].toString()).toMatch(message);
      });
    });
  });

  describe('not logging messages', () => {
    it('should ignore messages above the current log level', () => {
      log.configure({level: 'error'});
      log.silly('message');
      expect(writeSpy).not.toHaveBeenCalled();
    });
  });
});
