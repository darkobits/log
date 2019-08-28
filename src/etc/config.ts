import env from '@darkobits/env';
import OVER_9000 from 'over-9000';
import {LogOptions} from 'etc/types';


export const DEFAULT_THEME: Partial<LogOptions> = {
  style: {
    timestamp: (token, chalk) => chalk.keyword('gray')(`[${token}]`),
    heading: (token, chalk) => chalk.keyword('ghostwhite')(token),
    prefix: (token, chalk) => chalk.keyword('magenta')(token)
  },
  levels: {
    error: {
      style: (token, chalk) => chalk.keyword('orangered').bgKeyword('black')(token)
    },
    warn: {
      style: (token, chalk) => chalk.keyword('black').bgKeyword('gold')(token)
    },
    notice: {
      style: (token, chalk) => chalk.keyword('orange').bgKeyword('black')(token)
    },
    http: {
      style: (token, chalk) => chalk.keyword('lightseagreen')(token)
    },
    timing: {
      style: (token, chalk) => chalk.keyword('dodgerblue')(token)
    },
    info: {
      style: (token, chalk) => chalk.keyword('limegreen')(token)
    },
    verbose: {
      style: (token, chalk) => chalk.keyword('royalblue').bgKeyword('black')(token)
    },
    debug: {
      style: (token, chalk) => chalk.keyword('gray')(token)
    },
    silly: {
      style: (token, chalk) => chalk.keyword('black').bgKeyword('gainsboro')(token)
    }
  }
};


/**
 * Default options and levels for loggers. User-provided options will be merged
 * with these.
 */
export const DEFAULT_CONFIG: Partial<LogOptions> = {
  stream: () => process.stderr,
  level: env('LOG_LEVEL') || 'info',
  stripIndent: true,
  levels: {
    silent: {
      level: -Infinity,
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
