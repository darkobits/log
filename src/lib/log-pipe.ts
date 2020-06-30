import os from 'os';
import {Writable} from 'stream';

import ow from 'ow';
import stripAnsi from 'strip-ansi';

import {LAST_EOL_PATTERN} from 'etc/constants';
import {LogFunction} from 'etc/types';


/**
 * Implements a writable stream that will log all incoming messages using the
 * provided log function.
 *
 * This is designed to be used when a program spawns a child process, for
 * example, and wants to pipe() its output to the user using the logger.
 */
export default class LogPipe extends Writable {
  private readonly _logFn: LogFunction;

  constructor(logFn: LogFunction) {
    super();
    ow(logFn, 'log function', ow.function);
    this._logFn = logFn;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  _write(chunk: string, encoding: string, callback: (error?: Error | null) => void) {
    let str = Buffer.from(chunk).toString('utf8');

    // Skip empty strings because they have no effect on output and wind up
    // confusing the rest of our logging logic.
    if (str === '') {
      callback();
      return;
    }

    // If, after removing any ANSI escape sequences, the string ends with
    // an EOL, then remove the last EOL in the string while preserving ANSI
    // escape sequences.
    if (stripAnsi(str).endsWith(os.EOL)) {
      str = str.replace(LAST_EOL_PATTERN, '');
    }

    this._logFn(str);
    callback();
  }
}
