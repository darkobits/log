import {Console} from 'console';

import env from '@darkobits/env';
import mask from '@darkobits/mask-string';
import ansiEscapes from 'ansi-escapes';
import chalk from 'chalk';
import cliSpinners, {SpinnerName} from 'cli-spinners';
import * as dateFns from 'date-fns';
import merge from 'deepmerge';
import isPlainObject from 'is-plain-object';
import prettyMs from 'pretty-ms';

import {DEFAULT_OPTIONS, DEFAULT_LEVEL_OPTIONS} from 'etc/constants';

import {
  LevelDescriptor,
  Logger,
  LogOptions,
  StyleFunction
} from 'etc/types';

import {
  formatError,
  proxyStreamWrite
} from 'lib/utils';


/**
 * Provided an options object, returns a logger instance.
 */
export default function LogFactory(userOptions: LogOptions = {}): Logger {
  /**
   * Logger instance.
   */
  const log = Object.create(null) as Logger; // tslint:disable-line no-null-keyword


  /**
   * @private
   *
   * Configuration for the logger.
   */
  let options: LogOptions = {};


  /**
   * @private
   *
   * Custom console interface for the logger that will write to the indicated
   * stream. This is a convenient way to get us nice color support when logging
   * non-strings.
   */
  let c: Console;


  /**
   * @private
   *
   * Tracks whether the logger has an active spinner. Lets us ensure there is
   * only one active spinner at any given time.
   */
  let hasActiveSpinner = false;


  /**
   * @private
   *
   * Secrets that will be masked by the logger.
   */
  const secrets: Array<[string | RegExp, string]> = [];


  // ----- Private Methods -----------------------------------------------------

  /**
   * @private
   *
   * Provided a token and a function, invokes the function with the token and
   * the logger's Chalk instance and returns the result.
   */
  function styleToken(token: string | undefined, styleFn: StyleFunction | undefined) {
    if (token === undefined) {
      return;
    }

    if (typeof styleFn !== 'function') {
      return token;
    }

    return styleFn(token, log.chalk);
  }


  /**
   * @private
   *
   * Applies special formatting to various kinds of arguments passed to log
   * methods.
   */
  function formatLogArguments(...args: Array<any>) {
    return args.map(arg => {
      if (typeof arg === 'string') {
        return arg;
      }

      if (arg instanceof Error) {
        return formatError(log.chalk, arg);
      }

      return arg;
    });
  }


  /**
   * @private
   *
   * Common logic for logging an arbitrary number of arguments.
   */
  function logItems(level: string, ...args: Array<any>) {
    if (!log.isLevelAtLeast(level)) {
      return;
    }

    const {heading, levels, style, timestamp} = options;

    if (typeof levels !== 'object') {
      throw new Error(`Expected type of "levels" to be "object", got "${typeof levels}".`);
    }

    if (typeof style !== 'object') {
      throw new Error(`Expected type of "styles" to be "object", got "${typeof style}".`);
    }

    const lead = [
      // Timestamp
      timestamp ? styleToken(dateFns.format(new Date(), timestamp), style.timestamp) : false,
      // Heading
      styleToken(heading, style.heading),
      // Level
      styleToken(levels[level].label, levels[level].style)
    ].filter(Boolean);

    c.log(...lead, ...formatLogArguments(...args));
  }


  /**
   * @private
   *
   * Adds a new level and logging method to the logger.
   */
  function addLevel(name: string, levelOptions: LevelDescriptor) {
    // Throw if trying to add a level whose name matches an existing property on
    // the logger instance.
    if (Reflect.has(log, name)) {
      throw new Error(`Invalid log level: "${name}"`);
    }

    // Validate label.
    if (typeof levelOptions.label !== 'string') {
      throw new Error(`Expected type of "label" to be "string", got "${typeof levelOptions.label}".`);
    }

    // Validate level.
    if (typeof levelOptions.level !== 'number') {
      throw new Error(`Expected type of "level" to be "number", got "${typeof levelOptions.label}".`);
    }

    // Special-casing for the 'silent' level, which exists in the default log
    // levels but should not have a corresponding log method.
    if (name === 'silent') {
      return;
    }

    // Add method for level.
    Reflect.set(log, name, (...args: Array<any>) => {
      logItems(name, ...args);
    });
  }


  // ----- Public Methods ------------------------------------------------------

  log.getLevel = () => {
    const {level, levels} = options;

    if (!levels) {
      throw new Error(`Expected type of "levels" to be "object", got "${typeof levels}".`);
    }

    if (typeof level !== 'string') {
      throw new Error(`Expected type of "level" to be "string", got "${typeof level}".`);
    }

    return {...levels[level]} as LevelDescriptor;
  };


  log.isLevelAtLeast = name => {
    const {levels} = options;

    if (!levels) {
      throw new Error(`Expected type of "levels" to be "object", got "${typeof levels}".`);
    }

    const testLevel = levels[name] as LevelDescriptor;

    if (!testLevel) {
      throw new Error(`Invalid log level: "${name}".`);
    }

    return log.getLevel().level >= testLevel.level;
  };


  log.configure = (newConfig: Partial<LogOptions>) => {
    options = merge<Required<LogOptions>>(options, newConfig || {}, {
      isMergeableObject: isPlainObject
    });

    if (!options.levels) {
      throw new Error(`Expected type of "levels" to be "object", got "${typeof options.levels}".`);
    }

    // Update log level methods.
    Object.entries(options.levels).forEach(([name, descriptor]) => {
      if (!Reflect.has(log, name)) {
        addLevel(name, merge(DEFAULT_LEVEL_OPTIONS, descriptor || {}));
      }
    });
  };


  log.prefix = prefix => {
    const {style} = options;

    if (!style) {
      return prefix;
    }

    return styleToken(prefix, style.prefix) || prefix;
  };


  log.eraseLastLine = () => {
    if (typeof options.stream !== 'function') {
      throw new Error(`Expected type of "stream" to be "function", got "${typeof options.stream}".`);
    }

    options.stream().write(ansiEscapes.eraseLines(2));
  };


  log.createTimer = () => {
    const time = Date.now();

    return {
      format: (formatOptions = {}) => {
        return prettyMs(Date.now() - time, formatOptions);
      }
    };
  };


  log.createSpinner = (spinnerName = 'dots') => {
    const spinnerInfo = cliSpinners[spinnerName];

    if (!spinnerInfo) {
      throw new Error(`Invalid spinner name: "${spinnerName}".`);
    }

    const {frames, interval} = spinnerInfo;
    let intervalHandle: NodeJS.Timer;
    let curFrame = 0;
    let isFirstFrame = true;

    const start = (onFrame: Function) => {
      if (hasActiveSpinner) {
        throw new Error('Logger may only have one active spinner at a time.');
      }

      if (!intervalHandle) {
        hasActiveSpinner = true;

        intervalHandle = setInterval(() => {
          // Ensures we don't erase log lines on the first iteration.
          if (isFirstFrame) {
            isFirstFrame = false;
          } else {
            log.eraseLastLine();
          }

          onFrame(frames[curFrame]);
          curFrame = (curFrame + 1) % frames.length;
        }, interval);
      }
    };

    const stop = (onStop: Function) => {
      if (intervalHandle) {
        hasActiveSpinner = false;

        clearInterval(intervalHandle);
        log.eraseLastLine();
        onStop();
      }
    };

    return {start, stop};
  };


  log.addSecret = (secret, maskChar = '*') => {
    secrets.push([secret, maskChar]);
  };


  // ----- Init ----------------------------------------------------------------

  // Apply default options.
  log.configure(DEFAULT_OPTIONS);

  // Apply user-provided options.
  log.configure(userOptions);

  // Set the log level.
  log.configure({level: userOptions.level || env('LOG_LEVEL') || 'info'});

  // Configure the logger's Chalk instance.
  log.chalk = chalk.constructor(options.chalk);

  if (typeof options.stream !== 'function') {
    throw new Error(`Expected type of "stream" to be "function", got "${typeof options.stream}".`);
  }

  const logStream = options.stream();

  // Create a Proxy for the configured writable stream that will allow us to
  // mask any secrets after log messages have been formatted by the Console
  // instnace but before they are written to its output stream.
  const logStreamProxy = proxyStreamWrite((message: string, cb: Function) => {
    const newMessage = secrets.reduce<string>((messageAccumulator, [curSecret, curMaskChar]) => {
      return mask(curSecret, messageAccumulator, curMaskChar);
    }, message);

    return [newMessage, cb];
  }, logStream);

  // Create custom Console instance. N.B. Chalk's color detection is more
  // nuanced than Console's "isTTY" check, so we use that flag here to set color
  // support for our Console interface.
  c = new Console({
    stdout: logStreamProxy,
    ignoreErrors: true,
    colorMode: log.chalk.enabled,
    inspectOptions: {
      colors: log.chalk.enabled,
      compact: true
    }
  });


  return log;
}
