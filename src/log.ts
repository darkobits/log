import os from 'os';
import util from 'util';

import env from '@darkobits/env';
import mask from '@darkobits/mask-string';
import sleep from '@darkobits/sleep';
import stripIndent from '@darkobits/strip-indent';
import chalk from 'chalk';
import * as dateFns from 'date-fns';
import merge from 'deepmerge';
import IS_CI from 'is-ci';
import isPlainObject from 'is-plain-object';
import ow from 'ow';

import {
  DEFAULT_CONFIG,
  DEFAULT_THEME
} from 'etc/config';

import {
  DEFAULT_FRAME_RATE,
  DEFAULT_LEVEL_OPTIONS,
  IS_PREFIX
} from 'etc/constants';

import {
  BeginInteractiveOptions,
  LevelDescriptor,
  Logger,
  LogOptions,
  StyleFunction
} from 'etc/types';

import {
  createOrphanedObject,
  formatError
} from 'lib/utils';

import LogHistoryFactory, {LogHistory} from 'lib/history';
import isDebugNamespace from 'lib/is-debug-namespace';
import LogPipe from 'lib/log-pipe';
import ProgressBarFactory from 'lib/progress-bar';
import SpinnerFactory from 'lib/spinner';
import TimerFactory from 'lib/timer';


/**
 * Provided an options object, returns a logger instance.
 */
export default function LogFactory(userOptions: Partial<LogOptions> = {}) {
  /**
   * Logger instance.
   */
  const log = createOrphanedObject<Logger>();


  /**
   * @private
   *
   * Configuration for the logger.
   */
  let options = merge(DEFAULT_CONFIG, DEFAULT_THEME);


  /**
   * @private
   *
   * Secrets added via `addSecret` that will be masked by the logger.
   */
  const secrets: Array<[string | RegExp, string]> = [];


  /**
   * @private
   *
   * The logger's history ledger.
   */
  let history: LogHistory;


  // ----- Private Methods -----------------------------------------------------

  /**
   * @private
   *
   * Provided a log line, returns a new log line with each secret known to
   * the logger masked.
   */
  function maskSecretsInLine(line: string) {
    return secrets.reduce<string>((messageAccumulator, [curSecret, curMaskChar]) => {
      return mask(curSecret, messageAccumulator, curMaskChar);
    }, line);
  }


  /**
   * @private
   *
   * Provided a log line tuple, writes the line's content to our output stream
   * after masking any secrets contained therein.
   */
  function outputLogLine(logLine: string) {
    history.write(maskSecretsInLine(`${logLine}${os.EOL}`));
  }


  /**
   * @private
   *
   * Provided a token and a function, invokes the function with the token and
   * the logger's Chalk instance and returns the result.
   */
  function styleToken(token: string | number | boolean | undefined, styleFn: StyleFunction | undefined) {
    if (token === undefined) {
      return;
    }

    if (typeof styleFn !== 'function') {
      return token;
    }

    return styleFn(token as string, log.chalk);
  }


  /**
   * @private
   *
   * Provided a single argument passed to a logging function, returns a
   * serialzed and formatted string representation of the argument.
   */
  function formatLogArgument(arg: any) {
    // For strings, return the argument as-is.
    if (typeof arg === 'string') {
      if (options.stripIndent) {
        return stripIndent(arg, {stripEmptyLeading: true, stripEmptyTrailing: true});
      }

      return arg;
    }

    // For Errors, use `formatError`.
    if (arg instanceof Error) {
      return formatError(log.chalk, arg);
    }

    // For all other arguments, use `util.inspect`.
    return util.inspect(arg, {colors: true, depth: 20});
  }


  /**
   * @private
   *
   * Provided a log level and an arbitrary number of arguments, returns an array
   * of strings representing individual lines that should be written to the
   * logger's output stream.
   *
   * This function is responsible for rendering any headings, prefixes, styles,
   * and applying serialization techniques to arguments.
   */
  function convertArgumentsToLines(level: string, ...args: Array<any>) {
    const {heading, levels, style, timestamp} = options;

    ow(levels, 'levels', ow.object.plain);
    ow(style, 'style', ow.object.plain);

    let prefix = '';

    const lines = args.map(arg => {
      // If the current argument was produced by invoking log.prefix(), assign
      // it to `prefix` and return `false`, which will be filtered-out below.
      if (arg && arg[IS_PREFIX]) {
        prefix = arg;
        return false;
      }

      return formatLogArgument(arg);
    }).filter(Boolean).join(' ').split(os.EOL);

    // Build the lead for each line.
    const lead = [
      // Timestamp
      timestamp ? styleToken(dateFns.format(new Date(), timestamp), style.timestamp) : false,
      // Heading
      styleToken(heading, style.heading),
      // Level
      styleToken(levels[level].label, levels[level].style),
      // Prefix
      prefix
    ].filter(Boolean).join(' ');

    // Apply lead and prefix, then return an array of finalized lines.
    return lines.map(line => `${lead} ${line}`);
  }


  /**
   * @private
   *
   * Common logic for each logging method created with `addLevel`, where the
   * only notable distinction is the level for the message.
   */
  function handleLogArguments(level: string, ...args: Array<any>) {
    // No-op if the current level is insufficient to allow the incoming message
    // to be logged.
    if (!log.isLevelAtLeast(level)) {
      return;
    }

    // Convert our array of arguments into an array of formatted log lines.
    convertArgumentsToLines(level, ...args).forEach(logLine => {
      // For each line, write to our history (taking note of whether the line
      // was produced interactively or not) and write it to the logger's output
      // stream.
      outputLogLine(logLine);
    });
  }


  /**
   * @private
   *
   * Adds a new level (and logging method) to the logger.
   */
  function addLevel(name: string, levelOptions: LevelDescriptor) {
    ow(levelOptions.label, 'label', ow.string);
    ow(levelOptions.level, 'level', ow.number);

    // Special-casing for the 'silent' level, which exists in the default log
    // levels but should not have a corresponding log method.
    if (name === 'silent') {
      return;
    }

    // Add method for level.
    Reflect.set(log, name, (...args: Array<any>) => {
      handleLogArguments(name, ...args);
    });
  }


  /**
   * @private
   *
   * Common logic used by `startInteractive` and `stopInteractive` to handle
   * producing one or more interactive log lines.
   */
  function handleInteractiveWrite(sessionId: symbol, messageFn: any) {
    history.doInteractiveWrite(sessionId, messageFn);
  }


  // ----- Public Methods ------------------------------------------------------

  /**
   * N.B. These methods get their type definitions by virtue of being attached
   * to the log object.
   *
   * See: types.ts
   */

  log.getLevel = () => {
    const {level, levels} = options;
    return {...levels[level]} as LevelDescriptor;
  };


  log.getLevels = () => {
    const {levels} = options;

    return levels as {
      [key: string]: LevelDescriptor;
    };
  };


  log.isLevelAtLeast = name => {
    const {levels} = options;

    const testLevel = levels[name] as LevelDescriptor;

    if (!testLevel) {
      throw new Error(`Invalid log level: "${name}".`);
    }

    return log.getLevel().level >= testLevel.level;
  };


  log.configure = newOptions => {
    options = merge<Required<LogOptions>>(options, newOptions || {}, {
      isMergeableObject: isPlainObject
    });

    ow(options.stream, 'stream', ow.function);
    ow(options.levels, 'levels', ow.object.plain);

    // Update log level methods.
    Object.entries(options.levels).forEach(([name, descriptor]) => {
      if (!Reflect.has(log, name)) {
        addLevel(name, merge(DEFAULT_LEVEL_OPTIONS, descriptor || {}));
      }
    });
  };


  log.prefix = prefix => {
    let formattedPrefix = prefix;
    const {style} = options;

    if (style.prefix) {
      formattedPrefix = styleToken(prefix, style.prefix) || prefix;
    }

    return {
      [IS_PREFIX]: true,
      toString() {
        return formattedPrefix.toString();
      }
    };
  };


  log.beginInteractive = userInteractiveOptions => {
    let interactiveOptions: Required<BeginInteractiveOptions>;

    // Merge and validate options.
    if (typeof userInteractiveOptions === 'function') {
      interactiveOptions = {
        message: userInteractiveOptions,
        interval: DEFAULT_FRAME_RATE
      };
    } else {
      interactiveOptions = merge<Required<BeginInteractiveOptions>>({
        interval: DEFAULT_FRAME_RATE
      }, userInteractiveOptions);
    }

    const endInteractiveSession = (userStopOptions: BeginInteractiveOptions) => {
      let stopOptions: BeginInteractiveOptions;

      // Merge and validate options.
      if (typeof userStopOptions === 'function') {
        stopOptions = {
          message: userStopOptions
        };
      } else {
        stopOptions = userStopOptions;
      }

      // If we're in a CI environment, call the provided callback once and then
      // bail.
      if (IS_CI) {
        stopOptions.message();
        return;
      }

      if (stopOptions && typeof stopOptions.message === 'function') {
        handleInteractiveWrite(sessionId, stopOptions.message);
      }

      history.endInteractiveSession(sessionId);
    };

    // If we're in a CI environment, call the provided callback once and then
    // bail.
    if (IS_CI) {
      interactiveOptions.message();
      return endInteractiveSession;
    }

    const sessionId = history.beginInteractiveSession();

    ow(interactiveOptions.message, 'message', ow.function);
    ow(interactiveOptions.interval, 'interval', ow.number.positive);

    const interactiveLoop = async () => {
      while (history.hasInteractiveSession(sessionId)) {
        handleInteractiveWrite(sessionId, interactiveOptions.message);
        await sleep(interactiveOptions.interval);
      }
    };

    interactiveLoop(); // tslint:disable-line no-floating-promises

    return endInteractiveSession;
  };


  log.createTimer = timerOptions => {
    return TimerFactory(timerOptions);
  };


  log.createProgressBar = progressBarOptions => {
    return ProgressBarFactory(progressBarOptions);
  };


  log.createSpinner = createSpinnerOptions => {
    return SpinnerFactory(createSpinnerOptions);
  };


  log.addSecret = (secret, maskChar = '*') => {
    ow(secret, 'secret', ow.any(ow.string, ow.regExp));
    ow(maskChar, 'mask character', ow.string.minLength(1).maxLength(1));
    secrets.push([secret, maskChar]);
  };


  log.createPipe = level => {
    // Validate log level.
    if (!Object.keys(log.getLevels()).includes(level)) {
      throw new Error(`Invalid log level: ${level}`);
    }

    // @ts-ignore
    return new LogPipe(log[level]);
  };


  // ----- Init ----------------------------------------------------------------

  // Apply user-provided options.
  log.configure(userOptions);

  // Set the log level.
  if (options.heading && isDebugNamespace(options.heading)) {
    log.configure({level: 'silly'});
  } else {
    log.configure({level: env('LOG_LEVEL') || userOptions.level || 'info'});
  }

  // Create a custom Chalk instance for the logger using the provided options.
  log.chalk = chalk.constructor(options.chalk);

  // Initialize a LogHistory.
  history = LogHistoryFactory({stream: options.stream()});


  return log;
}
