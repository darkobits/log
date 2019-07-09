import {Chalk, ChalkOptions} from 'chalk';


/**
 * Object representing an RGB color.
 */
export interface ColorObject {
  red: number;
  green: number;
  blue: number;
}


/**
 * Object representing the style to apply to a log message component.
 */
export interface StyleObject {
  fg?: string | ColorObject;
  bg?: string | ColorObject;
}


/**
 * Object representing the configuration for a single log level.
 */
export interface LevelDescriptor {
  level: number;
  label: string;
  style?: StyleObject;
}


/**
 * Signature for log functions.
 */
export type LogFunction = (prefix: any, ...args: Array<any>) => void;


/**
 * Options object accepted by LogFactory.
 */
export interface LogOptions {
  /**
   * Optional heading for all messages logged by the logger.
   */
  heading?: string;

  /**
   * Optional level to log at. If not set, falls back to the LOG_LEVEL
   * environment variable or 'info'.
   */
  level?: string;

  /**
   * Optional style configuration for the logger.
   */
  style?: {
    /**
     * Optional style configuration for the logger's heading.
     */
    heading?: StyleObject;

    /**
     * Optional style configuration for log prefixes.
     */
    prefix?: StyleObject;
  };

  /**
   * Optional options to configure the logger's Chalk instance.
   */
  chalk?: ChalkOptions;
}


/**
 * Object returned by LogFactory.
 */
export interface Logger {
  /**
   * Chalk instance for the logger.
   */
  chalk: Chalk;

  /**
   * Returns the name and numeric value of the current log level.
   */
  getLevel(): {name: string; level: number};

  /**
   * Returns an object with each registered log level.
   */
  getLevels(): {[key: string]: number};

  /**
   * Sets the logger's level to the level indicated by the provided name. If the
   * level does not exist, an error will be thrown.
   */
  setLevel(name: string): void;

  /**
   * Returns `true` if a message at the provided log level would be logged based
   * on the current log level.
   */
  isLevelAtLeast(name: string): boolean;

  /**
   * Sets the logger's heading to the provided value. Optionally accepts a style
   * object.
   */
  setHeading(heading: string | undefined, style?: StyleObject): void;

  /**
   * Adds a new level to this logger using the provided name and value.
   */
  addLevel(name: string, levelOptions: LevelDescriptor): void;

  /**
   * Updates the configuration for an existing log level.
   */
  updateLevel(name: string, levelOptions: Partial<LevelDescriptor>): void;

  /**
   * Log a message at the 'error' level.
   */
  error(prefix: string, ...args: Array<any>): void;

  /**
   * Log a message at the 'warn' level.
   */
  warn(prefix: string, ...args: Array<any>): void;

  /**
   * Log a message at the 'notice' level.
   */
  notice(prefix: string, ...args: Array<any>): void;

  /**
   * Log a message at the 'http' level.
   */
  http(prefix: string, ...args: Array<any>): void;

  /**
   * Log a message at the 'timing' level.
   */
  timing(prefix: string, ...args: Array<any>): void;

  /**
   * Log a message at the 'info' level.
   */
  info(prefix: string, ...args: Array<any>): void;

  /**
   * Log a message at the 'verbose' level.
   */
  verbose(prefix: string, ...args: Array<any>): void;

  /**
   * Log a message at the 'silly' level.
   */
  silly(prefix: string, ...args: Array<any>): void;
}
