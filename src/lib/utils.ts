/* eslint-disable @typescript-eslint/unbound-method */
import os from 'os';

import {Chalk} from 'chalk';
import cleanStack from 'clean-stack';

const create = Object.create;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const isPrototypeOf = Object.prototype.isPrototypeOf;
const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
const toString = Object.prototype.toString;
const valueOf = Object.prototype.valueOf;
const toLocaleString = Object.prototype.toLocaleString;


interface OrphanedObject {
  [key: string]: any;
  hasOwnProperty: typeof Object['prototype']['hasOwnProperty'];
  isPrototypeOf: typeof Object['prototype']['isPrototypeOf'];
  propertyIsEnumerable: typeof Object['prototype']['propertyIsEnumerable'];
  toLocaleString: typeof Object['prototype']['toLocaleString'];
  toString: typeof Object['prototype']['toString'];
  valueOf: typeof Object['prototype']['valueOf'];
}


/**
 * Creates a new object of type T with no prototype.
 *
 * Designed to partially mitigate attacks like these:
 *
 * https://snyk.io/vuln/npm:lodash:20180130
 */
export function createOrphanedObject<T = any>() {
  // eslint-disable-next-line unicorn/no-null
  const obj = create(null) as T & OrphanedObject; // tslint:disable-line no-null-keyword

  obj.hasOwnProperty = v => Reflect.apply(hasOwnProperty, obj, [v]);
  obj.isPrototypeOf = v => Reflect.apply(isPrototypeOf, obj, [v]);
  obj.propertyIsEnumerable = v => Reflect.apply(propertyIsEnumerable, obj, [v]);
  obj.toLocaleString = () => Reflect.apply(toLocaleString, obj, []);
  obj.toString = () => Reflect.apply(toString, obj, []);
  obj.valueOf = () => Reflect.apply(valueOf, obj, []);

  return obj as T;
}


export function formatError(chalk: Chalk, err: Error) {
  const message = (err.stack ?? '').split(os.EOL)[0];
  const stack = cleanStack(err.stack ?? '', {pretty: true}).split(os.EOL).slice(1).join(os.EOL);

  return [
    chalk.red.bold(message),
    chalk.rgb(85, 85, 85)(stack)
  ].join(os.EOL);
}
