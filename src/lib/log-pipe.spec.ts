import os from 'os';
import uuid from 'uuid/v4';
import LogPipe from './log-pipe';


describe('LogPipe', () => {
  describe('#write', () => {
    it('should pass all output to the provided function', () => {
      const logFn = jest.fn();
      const logPipe = new LogPipe(logFn);
      const message = uuid();

      logPipe.write(message);
      expect(logFn).toHaveBeenCalledWith(message);
    });

    it('should skip empty strings', () => {
      const logFn = jest.fn();
      const logPipe = new LogPipe(logFn);
      const message = '';

      logPipe.write(message);
      expect(logFn).not.toHaveBeenCalled();
    });

    it('should strip trailing newlines', () => {
      const logFn = jest.fn();
      const logPipe = new LogPipe(logFn);
      const message = uuid();

      logPipe.write(`${message}${os.EOL}`);
      expect(logFn).toHaveBeenCalledWith(message);
    });

    it('should strip trailing newlines, accounting for trailing ANSI escapes', () => {
      const logFn = jest.fn();
      const logPipe = new LogPipe(logFn);
      const message = uuid();

      logPipe.write(`\u001B[4m${message}${os.EOL}\u001B[0m`);
      expect(logFn).toHaveBeenCalledWith(`\u001B[4m${message}\u001B[0m`);
    });
  });
});
