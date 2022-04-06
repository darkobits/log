import os from 'os';

import {LevelDescriptor} from 'etc/types';


/**
 * Symbol attached to prefix objects that allows them to be identified as such.
 */
export const IS_PREFIX = Symbol('IS_PREFIX');


/**
 * Base object used when adding new log levels.
 */
export const DEFAULT_LEVEL_OPTIONS: Partial<LevelDescriptor> = {
  level: 6000,
  style: (token, chalk) => chalk.keyword('limegreen')(token)
};


/**
 * How often we will re-write interactive log lines.
 */
export const DEFAULT_FRAME_RATE = 1000 / 60;


/**
 * Pattern that will match the last EOL character in a string.
 */
export const LAST_EOL_PATTERN = new RegExp(`${os.EOL}(?!.*${os.EOL})`);
