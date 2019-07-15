import env from '@darkobits/env';
import OVER_9000 from 'over-9000';
import {LevelDescriptor, LogOptions} from 'etc/types';


/**
 * Base object used when adding new log levels.
 */
export const DEFAULT_LEVEL_OPTIONS: Partial<LevelDescriptor> = {
  level: 6000,
  style: (token, chalk) => chalk.keyword('limegreen')(token)
};


/**
 * Default options and levels for loggers. User-provided options will be merged
 * with these.
 */
export const DEFAULT_OPTIONS: LogOptions = {
  stream: () => process.stderr,
  level: env('LOG_LEVEL') || 'info',
  style: {
    timestamp: (token, chalk) => chalk.keyword('gray')(token),
    heading: (token, chalk) => chalk.rgb(220, 220, 220)(token),
    prefix: (token, chalk) => chalk.keyword('purple')(token)
  },
  levels: {
    silent: {
      level: -Infinity,
      label: ''
    },
    error: {
      level: 1000,
      label: 'ERR!',
      style: (token, chalk) => chalk.keyword('crimson').bgKeyword('black')(token)
    },
    warn: {
      level: 2000,
      label: 'WARN',
      style: (token, chalk) => chalk.keyword('black').bgRgb(230, 230, 0)(token)
    },
    notice: {
      level: 3000,
      label: 'notice',
      style: (token, chalk) => chalk.keyword('royalblue').bgKeyword('black')(token)
    },
    http: {
      level: 4000,
      label: 'http',
      style: (token, chalk) => chalk.rgb(13, 188, 121)(token)
    },
    timing: {
      level: 5000,
      label: 'timing',
      style: (token, chalk) => chalk.rgb(13, 188, 121)(token)
    },
    info: {
      level: 6000,
      label: 'info',
      style: (token, chalk) => chalk.rgb(13, 188, 121)(token)
    },
    verbose: {
      level: 7000,
      label: 'verb',
      style: (token, chalk) => chalk.keyword('royalblue').bgKeyword('black')(token)
    },
    silly: {
      level: OVER_9000,
      label: 'sill',
      style: (token, chalk) => chalk.keyword('black').bgRgb(204, 204, 204)(token)
    }
  }
};
