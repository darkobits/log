import {Chalk, ChalkOptions} from 'chalk';
import {SpinnerName} from 'cli-spinners';
import prettyMs from 'pretty-ms';


/**
 * Object representing an RGB color.
 */
export interface ColorObject {
  red: number;
  green: number;
  blue: number;
}


/**
 * Signature for custom styling functions.
 */
export type StyleFunction = (token: string, chalk: Chalk) => string;


/**
 * Object representing the style to apply to a log message component.
 */
export interface StyleObject {
  fg?: string | ColorObject | StyleFunction;
  bg?: string | ColorObject | StyleFunction;
}


/**
 * Object representing the configuration for a single log level.
 */
export interface LevelDescriptor {
  level: number;
  label: string;
  style?: StyleFunction;
}


/**
 * Signature for log functions.
 */
export type LogFunction = (...args: Array<any>) => void;


/**
 * Object returned by #.createTimer.
 */
export interface Timer {
  format(options?: prettyMs.Options): string;
}


/**
 * Function returned by #.spinner.
 */
export interface Spinner {
  start(onFrame: (frame: string) => any): void;
  stop(onStop: () => any): void;
}


/**
 * Options object accepted by LogFactory.
 */
export interface LogOptions {
  /**
   * Writable stream that the logger will use.
   *
   * Default: process.stderr
   */
  stream?: () => NodeJS.WritableStream;

  /**
   * Optional timestamp format. If set to `false`, timestamps will be disabled.
   */
  timestamp?: string;

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
     * Formatter for timestamps.
     */
    timestamp?: StyleFunction;

    /**
     * Formatter for headings.
     */
    heading?: StyleFunction;

    /**
     * Formatter for prefixes.
     */
    prefix?: StyleFunction;
  };

  /**
   * Optional options to configure the logger's Chalk instance.
   */
  chalk?: ChalkOptions;

  /**
   * Optional custom level definitions. These will be merged with the default
   * log levels.
   */
  levels?: {
    [key: string]: Partial<LevelDescriptor>;
  };
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
   * Returns the LevelDescriptor for the current log level.
   */
  getLevel(): LevelDescriptor;

  /**
   * Returns `true` if a message at the provided log level would be logged based
   * on the current log level.
   */
  isLevelAtLeast(name: string): boolean;

  /**
   * Merges the provided configuration object with the logger's existing
   * configuration. This method can be used to add levels, set the current
   * level, set the current heading, update styles, etc.
   */
  configure(newConfig: LogOptions): void;


  // ----- Utilities -----------------------------------------------------------

  /**
   * Style the provided string according to the logger's prefix style.
   */
  prefix(prefix: string): string;

  /**
   * Create a new timer.
   */
  createTimer(): Timer;

  /**
   * Create a spinner;
   */
  createSpinner(name?: SpinnerName): Spinner;

  /**
   * Erases the last line written to the logger's stream.
   */
  eraseLastLine(): void;

  /**
   * Adds a secret to the logger. Any occurrances of matched tokens in messages
   * will be masked.
   */
  addSecret(secret: string | RegExp, maskChar?: string): void;


  // ----- Default Log Methods -------------------------------------------------

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
