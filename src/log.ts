// @ts-ignore
import importUnique from '@darkobits/import-unique';


/**
 * Imports a unique copy of "npmlog", optionally setting the heading and level.
 */
export default function NpmLogFactory(heading?: string, level?: string) {
  // Unique instance of npmlog.
  const log = importUnique('npmlog');

  const {LOG_LEVEL} = process.env;

  // Predicate which returns true if npmlog has the provided log level.
  const hasLevel = (l: string) => Object.keys(log.levels).includes(l);

  // Optionally set the heading.
  if (heading) {
    log.heading = heading;
  }

  // Optionally validate and set the log level.
  if (LOG_LEVEL && hasLevel(LOG_LEVEL)) {
    log.level = LOG_LEVEL;
  } else if (level) {
    if (hasLevel(level)) {
      log.level = level;
    } else {
      throw new Error(`Unsupported log level: "${level}".`);
    }
  }

  // Replace each log method with one that, when provided an instance of Error,
  // simply logs its stack.
  Object.keys(log.levels).forEach((level: string) => {
    const origMethod = log[level];

    log[level] = (prefix: string, ...args: Array<any>) => {
      return Reflect.apply(origMethod, log, [prefix, ...args.map(arg => {
        return arg instanceof Error ? arg.stack : arg;
      })]);
    };
  });

  return log;
}
