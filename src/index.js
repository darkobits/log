import importUnique from '@darkobits/import-unique';


/**
 * Returns the non-message component of an Error's stack trace.
 *
 * @param {string} stackStr - The 'stack' property of an error.
 */
function parseStack(stackStr) {
  const stackArr = stackStr.split('\n');

  return stackArr.slice(
    stackArr.findIndex(line => line.startsWith('    at')),
    stackArr.length
  ).join('\n');
}


/**
 * Imports a unique copy of "npmlog", optionally setting the heading and level.
 *
 * @param  {string} [heading]
 * @param  {string} [level]
 * @return {object} - Unique npmlog instance.
 */
export default function NpmLogFactory(heading = '', level = '') {
  const log = importUnique('npmlog');

  log.heading = heading;
  log.level = level || process.env.LOG_LEVEL || log.level;

  const origError = log.error;

  // If provided an instance of Error as our second param, print its message and
  // stack.
  log.error = (prefix, ...args) => {
    if (args[0] instanceof Error) {
      Reflect.apply(origError, log, [prefix, args[0].message]);
      Reflect.apply(origError, log, [prefix, parseStack(args[0].stack)]);
    } else {
      Reflect.apply(origError, log, [prefix, ...args]);
    }
  };

  return log;
}
