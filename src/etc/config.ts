import env from '@darkobits/env';
import OVER_9000 from 'over-9000';

import {LogOptions} from 'etc/types';


/**
 * Default stream we will write to.
 */
export const DEFAULT_STREAM = process.stderr;


/**
 * Default options and levels for loggers. Default styles (see style.ts) and
 * user-provided options will be merged with these.
 */
const DEFAULT_CONFIG: Partial<LogOptions> = {
  level: env('LOG_LEVEL') ?? 'info',
  stripIndent: true,
  levels: {
    silent: {
      level: Number.NEGATIVE_INFINITY,
      label: ''
    },
    error: {
      level: 1000,
      label: 'ERR!'
    },
    warn: {
      level: 2000,
      label: 'WARN'
    },
    notice: {
      level: 3000,
      label: 'notice'
    },
    http: {
      level: 4000,
      label: 'http'
    },
    timing: {
      level: 5000,
      label: 'timing'
    },
    info: {
      level: 6000,
      label: 'info'
    },
    verbose: {
      level: 7000,
      label: 'verb'
    },
    debug: {
      level: 8000,
      label: 'debug'
    },
    silly: {
      level: OVER_9000,
      label: 'sill'
    }
  }
};


export default DEFAULT_CONFIG;
