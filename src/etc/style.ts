import {LogOptions} from 'etc/types';


/**
 * Default styles for the logger. This object will be merged with default
 * configuration (see config.ts) and any user-provided options.
 */
const DEFAULT_STYLE: Partial<LogOptions> = {
  style: {
    timestamp: (token, chalk) => chalk.keyword('gray')(`[${token}]`),
    heading: (token, chalk) => chalk.keyword('ghostwhite')(token),
    prefix: (token, chalk) => chalk.keyword('fuchsia')(token)
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
      style: (token, chalk) => chalk.keyword('mediumseagreen')(token)
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


export default DEFAULT_STYLE;
