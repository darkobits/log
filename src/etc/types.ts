import {Chalk} from 'chalk';
import {LogLevels, MessageObject, StyleObject} from 'npmlog';


export interface Log {
  /**
   * Unique instnace of Chalk attached to each logger instance.
   */
  chalk: Chalk;

  /**
   * The current log level.
   */
  level: string;

  /**
   * Style for the log prefix.
   */
  prefixStyle: StyleObject;

  /**
   * Style for the log heading.
   */
  headingStyle: StyleObject;

  /**
   * The current log heading.
   */
  heading: string;

  /**
   * Output stream to write log messages to. Defaults to "process.stderr".
   */
  stream: any;

  record: Array<MessageObject>;

  maxRecordSize: number;

  /**
   * Generic log function. Requires a level as the first parameter.
   */
  log(level: LogLevels | string, prefix: string, message: any, ...args: Array<any>): void;

  /**
   * Log a message at the "silly" log level.
   */
  silly(prefix: string, message: any, ...args: Array<any>): void;

  /**
   * Log a message at the "verbose" log level.
   */
  verbose(prefix: string, message: any, ...args: Array<any>): void;

  /**
   * Log a message at the "info" log level.
   */
  info(prefix: string, message: any, ...args: Array<any>): void;

  /**
   * Log a message at the "http" log level.
   */
  http(prefix: string, message: any, ...args: Array<any>): void;

  /**
   * Log a message at the "warn" log level.
   */
  warn(prefix: string, message: any, ...args: Array<any>): void;

  /**
   * Log a message at the "error" log level.
   */
  error(prefix: string, message: any, ...args: Array<any>): void;

  /**
   * Enable color on log messages.
   */
  enableColor(): void;

  /**
   * Disable color on log messages.
   */
  disableColor(): void;

  /**
   * Add a new log level to the logger.
   */
  addLevel(level: string, n: number, style?: StyleObject, disp?: string): void;

  enableProgress(): void;

  disableProgress(): void;

  enableUnicode(): void;

  disableUnicode(): void;

  pause(): void;

  resume(): void;
}
