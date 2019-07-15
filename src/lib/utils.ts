import {Chalk} from 'chalk';


export function formatError(chalk: Chalk, err: Error) {
  if (!err.stack) {
    return err;
  }

  const [message, ...stack] = err.stack.split('\n');

  return [
    chalk.red.bold(message),
    ...stack.map(line => chalk.rgb(85, 85, 85)(line))
  ].join('\n');
}


/**
 * Provided an interceptor function and a WritableStream, returns a Proxy to the
 * stream such that any calls to #.write will first be passed to the provided
 * interceptor, which should accept a list of arguments and return a modified
 * list of arguments.
 */
export function proxyStreamWrite(interceptor: (...args: Array<any>) => Array<any>, writableStream: NodeJS.WritableStream) {
  const handler = {
    get: (target: any, propKey: string | symbol) => {
      if (propKey !== 'write') {
        return target[propKey];
      }

      return (...args: Array<any>) => {
        return Reflect.apply(target[propKey], target, interceptor(...args));
      };
    }
  };

  return new Proxy(writableStream, handler);
}
