import uuid from 'uuid/v4';
import LogHistoryFactory, {LogHistory} from './history';


describe('LogHistory', () => {
  let logHistory: LogHistory;
  const mockWrite = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    // @ts-ignore
    logHistory = LogHistoryFactory({stream: {write: mockWrite}});
  });

  describe('#beginInteractiveSession', () => {
    it('should return an interactive session ID', () => {
      const id = logHistory.beginInteractiveSession();
      expect(typeof id).toBe('symbol');
      expect(logHistory.hasInteractiveSession(id)).toBe(true);
    });
  });

  describe('#endInteractiveSession', () => {
    describe('when provided an unknown session ID', () => {
      it('should throw an error', () => {
        const badId = Symbol();

        expect(() => {
          logHistory.endInteractiveSession(badId);
        }).toThrow('Unknown interactive session ID.');
      });
    });

    it('should remove the provided ID', () => {
      const id = logHistory.beginInteractiveSession();
      expect(logHistory.hasInteractiveSession(id)).toBe(true);
      logHistory.endInteractiveSession(id);
      expect(logHistory.hasInteractiveSession(id)).toBe(false);
    });
  });

  describe('#hasInteractiveSession', () => {
    describe('when provided a known/active session ID', () => {
      it('should return true', () => {
        const id = logHistory.beginInteractiveSession();
        expect(logHistory.hasInteractiveSession(id)).toBe(true);
      });
    });

    describe('when provided an unknown/inactive session ID', () => {
      it('should return false', () => {
        const unknownId = Symbol();
        expect(logHistory.hasInteractiveSession(unknownId)).toBe(false);

        const id = logHistory.beginInteractiveSession();
        expect(logHistory.hasInteractiveSession(id)).toBe(true);
        logHistory.endInteractiveSession(id);
        expect(logHistory.hasInteractiveSession(id)).toBe(false);
      });
    });
  });

  describe('#doInteractiveWrite', () => {
    describe('when provided an unknown session ID', () => {
      it('should throw an error', () => {
        const unknownId = Symbol();

        expect(() => {
          logHistory.doInteractiveWrite(unknownId, jest.fn());
        }).toThrow('Unknown interactive session ID.');
      });
    });

    describe('when an interactive write is in progress', () => {
      it('should throw an error', () => {
        const id = logHistory.beginInteractiveSession();

        logHistory.doInteractiveWrite(id, () => {
          expect(() => {
            logHistory.doInteractiveWrite(id, jest.fn());
          }).toThrow('Only 1 interactive write allowed at a time.');
        });
      });
    });

    it('should invoke the provided callback', async () => {

      const cb = jest.fn(() => {
        logHistory.write(uuid());
        logHistory.write(`${uuid()}\n`);
      });

      const id = logHistory.beginInteractiveSession();

      // Write some non-interactive content _after_ we have begun an interactive
      // session.
      logHistory.write(`${uuid()}\n`);

      logHistory.doInteractiveWrite(id, cb);

      logHistory.write(`${uuid()}\n`);

      logHistory.doInteractiveWrite(id, cb);

      expect(cb).toHaveBeenCalled();
      expect(mockWrite).toHaveBeenCalledTimes(8);
    });
  });

  describe('#write', () => {
    it('should call the configured writable streams #write method', () => {
      const message = uuid();
      logHistory.write(message);
      expect(mockWrite).toHaveBeenCalledWith(message);
    });
  });
});
