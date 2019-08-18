import {Chalk, ChalkOptions} from 'chalk';
import {IS_PREFIX} from 'etc/constants';
import {ProgressBarOptions, ProgressBar} from 'lib/progress-bar';
import {SpinnerOptions, Spinner} from 'lib/spinner';
import {TimerOptions, Timer} from 'lib/timer';


// ----- Styling ---------------------------------------------------------------

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


// ----- Misc ------------------------------------------------------------------

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
export type LogFunction<T = void> = (...args: Array<any>) => T;


/**
 * Object returned by the logger's `prefix` method that carries a special flag
 * indicating it is a prefix. This is done so that when logging multi-line
 * messages, we can extract prefixes and ensure they are inserted into each
 * line's lead.
 */
export interface Prefix {
  [IS_PREFIX]: boolean;
  toString(): string;
}


// ----- Interactivity ---------------------------------------------------------

export interface BeginInteractiveOptions {
  /**
   * Callback that will be invoked at each configured interval. This function
   * should call one of the logger's log methods once and only once to produce
   * a new output line that will overwrite the line from the previous interval.
   */
  message(): any;

  /**
   * (Optional) Number of milliseconds between intervals.
   *
   * Default: 1000 / 30 (30 updates per second)
   */
  interval?: number;
}

export type EndInteractiveOptions = Omit<BeginInteractiveOptions, 'interval'>;

export type EndInteractiveFn = (options?: (() => any) | EndInteractiveOptions) => void;


// ----- Logger ----------------------------------------------------------------

/**
 * Options object accepted by LogFactory and #.configure.
 */
export interface LogOptions {
  /**
   * Writable stream that the logger will use.
   *
   * Default: process.stderr
   */
  stream: () => NodeJS.WritableStream;

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
  level: string;

  /**
   * Whether to normalize whitespace in multi-line strings.
   *
   * Default: true
   */
  stripIndent: boolean;

  /**
   * Optional style configuration for the logger.
   */
  style: {
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
  levels: {
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
   * Returns an object of LevelDescriptors for each level registered with the
   * logger.
   */
  getLevels(): {
    [key: string]: LevelDescriptor;
  };

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
  configure(newConfig: Partial<LogOptions>): void;


  // ----- Utilities -----------------------------------------------------------

  /**
   * Style the provided string according to the logger's prefix style.
   */
  prefix(prefix: string | number | boolean): Prefix;

  /**
   * Adds a secret to the logger. Any occurrances of matched tokens in messages
   * will be masked.
   */
  addSecret(secret: string | RegExp, maskChar?: string): void;

  /**
   * Create a pipe that will log anything written to it at the provided log
   * level.
   */
  createPipe(level: string): NodeJS.WritableStream;


  // ----- Interactivity -------------------------------------------------------

  /**
   * Begins an interactive line session.
   */
  beginInteractive(options: (() => any) | BeginInteractiveOptions): EndInteractiveFn;

  /**
   * Creates a timer.
   */
  createTimer(options?: TimerOptions): Timer;

  /**
   * Creates a progress bar.
   */
  createProgressBar(options: ProgressBarOptions): ProgressBar;

  /**
   * Creates a spinner.
   */
  createSpinner(options?: SpinnerOptions): Spinner;


  // ----- Default Log Methods -------------------------------------------------

  /**
   * Log a message at the 'error' level.
   */
  error: LogFunction;

  /**
   * Log a message at the 'warn' level.
   */
  warn: LogFunction;

  /**
   * Log a message at the 'notice' level.
   */
  notice: LogFunction;

  /**
   * Log a message at the 'http' level.
   */
  http: LogFunction;

  /**
   * Log a message at the 'timing' level.
   */
  timing: LogFunction;

  /**
   * Log a message at the 'info' level.
   */
  info: LogFunction;

  /**
   * Log a message at the 'verbose' level.
   */
  verbose: LogFunction;

  /**
   * Log a message at the 'silly' level.
   */
  silly: LogFunction;
}
