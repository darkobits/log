import env from '@darkobits/env';
import chalk from 'chalk';
import merge from 'deepmerge';

import {
  DEFAULT_LOG_LEVELS,
  DEFAULT_HEADING_STYLE,
  DEFAULT_PREFIX_STYLE
} from 'etc/constants';

import {
  LevelDescriptor,
  Logger,
  LogFunction,
  LogOptions,
  StyleObject
} from 'etc/types';


/**
 * Provided an options object, returns a logger instance.
 */
export default function LogFactory(userLogOptions?: LogOptions): Logger {
  // Merge user options with defaults.
  const logOptions = merge({
    style: {
      heading: DEFAULT_HEADING_STYLE,
      prefix: DEFAULT_PREFIX_STYLE
    }
  }, userLogOptions || {});

  // Logger instance.
  const log = {} as Logger;


  // ----- Private Members -----------------------------------------------------

  /**
   * @private
   *
   * Name of the current log level.
   */
  let _levelName: string;

  /**
   * @private
   *
   * Current heading for the logger.
   */
  let _heading = '';

  /**
   * @private
   *
   * Log levels for the current instance.
   */
  const _logLevels: {[key: string]: LevelDescriptor} = {};


  // ----- Public Members ------------------------------------------------------

  log.chalk = chalk.constructor(logOptions.chalk);


  // ----- Private Methods -----------------------------------------------------

  /**
   * @private
   *
   * Accepts a Chalk instance and a StyleObject and returns a function that when
   * provided a list of arguments, returns a string containing the styled versions
   * of the provided arguments.
   */
  function buildStyleFunction(styleObj: StyleObject | undefined) {
    let styler = log.chalk;

    if (!styleObj) {
      return styler;
    }

    if (styleObj.fg) {
      if (typeof styleObj.fg === 'object') {
        const {red, green, blue} = styleObj.fg;
        styler = styler.rgb(red, green, blue);
      } else {
        styler = styler.keyword(styleObj.fg);
      }
    }

    if (styleObj.bg) {
      if (typeof styleObj.bg === 'object') {
        const {red, green, blue} = styleObj.bg;
        styler = styler.bgRgb(red, green, blue);
      } else {
        styler = styler.bgKeyword(styleObj.bg);
      }
    }

    return styler;
  }


  // ----- Public Methods ------------------------------------------------------

  log.getLevel = () => {
    return {
      name: _levelName,
      level: _logLevels[_levelName].level
    };
  };

  log.getLevels = () => {
    return Object.entries(_logLevels).reduce((result, [name, descriptor]) => {
      result[name] = descriptor.level;
      return result;
    }, {} as {[key: string]: number});
  };

  log.setLevel = name => {
    // Throw if trying to set an invalid log level.
    if (!Reflect.has(_logLevels, name)) {
      throw new Error(`Invalid log level: "${name}".`);
    }

    _levelName = name;
  };

  log.isLevelAtLeast = name => {
    const level = _logLevels[name];

    if (!level) {
      throw new Error(`Invalid log level: "${name}".`);
    }

    return _logLevels[_levelName].level >= level.level;
  };

  log.setHeading = (heading, style = {}) => {
    if (!heading) {
      _heading = '';
      return;
    }

    if (typeof heading !== 'string') {
      throw new Error(`Expected type of "heading" to be "string", got "${typeof heading}"`);
    }

    _heading = heading;

    if (style) {
      logOptions.style.heading = merge(logOptions.style.heading || {}, style);
    }
  };

  log.addLevel = (name, levelOptions) => {
    // Throw if trying to add a level that already exists.
    if (_logLevels[name]) {
      throw new Error(`Log level "${name}" already exists.`);
    }

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

    // Add level.
    _logLevels[name] = levelOptions;

    // Special-casing for the 'silent' level, which exists in the default log
    // levels but should not have a corresponding log method.
    if (name === 'silent') {
      return;
    }

    // Add method for level.
    const logFunction: LogFunction = (prefix, ...args) => {
      if (!log.isLevelAtLeast(name)) {
        return;
      }

      const lead = [
        _heading ? buildStyleFunction(logOptions.style.heading)(_heading) : false,
        buildStyleFunction(_logLevels[name].style)(_logLevels[name].label),
        prefix ? buildStyleFunction(logOptions.style.prefix)(prefix) : false
      ].filter(Boolean);

      console.error(...lead, ...args);
    };

    Reflect.set(log, name, logFunction);
  };

  log.updateLevel = (name, levelOptions) => {
    if (!_logLevels[name]) {
      throw new Error(`Log level "${name}" does not exist.`);
    }

    _logLevels[name] = merge(_logLevels[name], levelOptions);
  };


  // ----- Init ----------------------------------------------------------------

  // Set heading style based on options/defaults.
  log.setHeading(logOptions.heading);

  // Use addLevel to add default log levels.
  Object.entries(DEFAULT_LOG_LEVELS).forEach(([name, descriptor]) => {
    log.addLevel(name, descriptor);
  });

  // Set the log level to the configured level, LOG_LEVEL, or 'info'.
  log.setLevel(logOptions.level || env('LOG_LEVEL') || 'info');


  return log;
}
