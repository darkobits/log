import {LevelDescriptor, StyleObject} from 'etc/types';


export const DEFAULT_HEADING_STYLE: StyleObject = {
  fg: {red: 220, green: 220, blue: 220},
  bg: 'black',
};


export const DEFAULT_PREFIX_STYLE: StyleObject = {
  fg: 'purple'
};


export const DEFAULT_LOG_LEVELS: {[key: string]: LevelDescriptor} = {
  silly: {
    level: 0,
    label: 'sill',
    style: {
      fg: 'black',
      bg: {red: 204, green: 204, blue: 204}
    }
  },
  verbose: {
    level: 100,
    label: 'verb',
    style: {
      fg: 'royalblue',
      bg: 'black'
    }
  },
  info: {
    level: 200,
    label: 'info',
    style: {
      fg: 'limegreen'
    }
  },
  timing: {
    level: 300,
    label: 'timing',
    style: {
      fg: 'limegreen'
    }
  },
  http: {
    level: 400,
    label: 'http',
    style: {
      fg: 'limegreen'
    }
  },
  notice: {
    level: 500,
    label: 'notice',
    style: {
      fg: 'royalblue',
      bg: 'black'
    }
  },
  warn: {
    level: 600,
    label: 'WARN',
    style: {
      fg: 'black',
      bg: {red: 230, green: 230, blue: 0}
    }
  },
  error: {
    level: 700,
    label: 'ERR!',
    style: {
      fg: 'crimson',
      bg: 'black'
    }
  }
};
