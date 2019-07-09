import OVER_9000 from 'over-9000';
import {LevelDescriptor, StyleObject} from 'etc/types';


export const DEFAULT_HEADING_STYLE: StyleObject = {
  fg: {red: 220, green: 220, blue: 220},
  bg: 'black',
};


export const DEFAULT_PREFIX_STYLE: StyleObject = {
  fg: 'purple'
};


export const DEFAULT_LOG_LEVELS: {[key: string]: LevelDescriptor} = {
  silent: {
    level: -Infinity,
    label: ''
  },
  error: {
    level: 1000,
    label: 'ERR!',
    style: {
      fg: 'crimson',
      bg: 'black'
    }
  },
  warn: {
    level: 2000,
    label: 'WARN',
    style: {
      fg: 'black',
      bg: {red: 230, green: 230, blue: 0}
    }
  },
  notice: {
    level: 3000,
    label: 'notice',
    style: {
      fg: 'royalblue',
      bg: 'black'
    }
  },
  http: {
    level: 4000,
    label: 'http',
    style: {
      fg: 'limegreen'
    }
  },
  timing: {
    level: 5000,
    label: 'timing',
    style: {
      fg: 'limegreen'
    }
  },
  info: {
    level: 6000,
    label: 'info',
    style: {
      fg: 'limegreen'
    }
  },
  verbose: {
    level: 7000,
    label: 'verb',
    style: {
      fg: 'royalblue',
      bg: 'black'
    }
  },
  silly: {
    level: OVER_9000,
    label: 'sill',
    style: {
      fg: 'black',
      bg: {red: 204, green: 204, blue: 204}
    }
  }
};
