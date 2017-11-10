import importUnique from '@darkobits/import-unique';


/**
 * Imports a unique copy of "npmlog", optionally setting the heading and level.
 *
 * @param  {string} [heading]
 * @param  {string} [level]
 * @return {object} - Unique npmlog instance.
 */
export default function ImprovedNpmLogFactory(heading = '', level = '') {
  const log = importUnique('npmlog');

  log.heading = heading;
  log.level = level || process.env.LOG_LEVEL || log.level;

  return log;
}
