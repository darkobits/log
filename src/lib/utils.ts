import os from 'os';
import {Chalk} from 'chalk';
import cleanStack from 'clean-stack';


/**
 * Creates a new object with no prototype of type T.
 */
export function createOrphanedObject<T = {[key: string]: any}>() {
  return Object.create(null) as T; // tslint:disable-line no-null-keyword
}


export function formatError(chalk: Chalk, err: Error) {
  const message = (err.stack || '').split(os.EOL)[0];
  const stack = cleanStack(err.stack || '', {pretty: true}).split(os.EOL).slice(1).join(os.EOL);

  return [
    chalk.red.bold(message),
    chalk.rgb(85, 85, 85)(stack)
  ].join(os.EOL);
}
