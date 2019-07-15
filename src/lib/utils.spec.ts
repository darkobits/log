import os from 'os';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';

import {
  createOrphanedObject,
  formatError
} from './utils';


describe('createOrphanedObject', () => {
  it('should create an object with no prototype', () => {
    const plainObject = {};
    expect(typeof plainObject.hasOwnProperty).toBe('function');

    const orphanedObject = createOrphanedObject();
    expect(typeof orphanedObject.hasOwnProperty).toBe('undefined');
  });
});


describe('formatError', () => {
  it('should return a formatted string', () => {
    const err = new Error('oh noes!');
    const result = formatError(chalk, err);
    expect(stripAnsi(result.split(os.EOL)[0])).toBe('Error: oh noes!');
  });
});
