import merge from 'deepmerge';
import ow from 'ow';
import prettyMs from 'pretty-ms';

import {createOrphanedObject} from 'lib/utils';


/**
 * Options object accepted by ProgressBarFactory and #createProgressBar.
 */
export interface ProgressBarOptions {
  /**
   * Function that will be invoked each time the progress bar renders. This
   * function should return a number between 0 and 1 indicating how full the bar
   * should be.
   */
  getProgress(): number;

  /**
   * Optional tokenized string representing the desired format of the progress
   * bar.
   *
   * Allowed tokens are:
   * - :bar - The progress bar itself.
   * - :percentage - The percentage of the bar that is complete (ex: 25%)
   * - :elapsed - Time elapsed since the progress bar's creation.
   * - :remaining - Estimated time remaining until the progress bar completes.
   *
   * Default: ':bar :percentage'
   */
  format?: string;

  /**
   * Optional width of the inner progress bar. That is, all characters between
   * its head and its tail.
   *
   * Default: 12
   */
  width?: number;

  /**
   * Optional format to use when rendering the :elapsed and :remaining tokens.
   *
   * See: https://github.com/sindresorhus/pretty-ms/blob/master/index.d.ts#L2-L64
   */
  timeFormat?: prettyMs.Options;

  /**
   * Optional overrides for the characters used when rendering the progress bar.
   * All symbols must be a single character.
   */
  symbols?: {
    /**
     * First/leftmost character.
     *
     * Default: '['
     */
    head?: string;

    /**
     * Last/rightmost character.
     *
     * Default: ']'
     */
    tail?: string;

    /**
     * Character used to represent the completed portion of the progress bar.
     *
     * Default: '='
     */
    complete?: string;

    /**
     * Character used to separate the complete and incomplete portions of the
     * progress bar.
     *
     * Default: '>'
     */
    completeHead?: string;

    /**
     * Character used to represent the incomplete portion of the progress bar.
     *
     * Default: '-'
     */
    incomplete?: string;
  };
}


/**
 * Object returned by ProgressBarFactory and #createProgressBar.
 */
export interface ProgressBar {
  toString(): string;
}


/**
 * Default progress bar options.
 *
 * These options will render a progress bar that looks like this:
 *
 * [==>---------] 25%
 */
const DEFAULT_OPTIONS = {
  format: ':bar :percentage',
  symbols: {
    head: '[',
    tail: ']',
    complete: '=',
    completeHead: '>',
    incomplete: '-'
  },
  width: 12
};


/**
 * Creates a new progress bar using the provided options. The returned value may
 * be used directly in an interpolated string.
 */
export default function ProgressBarFactory(userOptions: ProgressBarOptions) {
  const progressBar = createOrphanedObject<ProgressBar>();

  // Merge and validate options.
  const options = merge<Required<ProgressBarOptions>>(DEFAULT_OPTIONS, userOptions || {});
  ow(options.format, 'format', ow.string);
  ow(options.width, 'width', ow.number.integer);
  ow(options.symbols.head, 'head', ow.string.maxLength(1));
  ow(options.symbols.tail, 'head', ow.string.maxLength(1));
  ow(options.symbols.complete, 'head', ow.string.maxLength(1));
  ow(options.symbols.completeHead, 'head', ow.string.maxLength(1));
  ow(options.symbols.incomplete, 'head', ow.string.maxLength(1));
  ow(options.getProgress, 'getProgress', ow.function);


  /**
   * @private
   *
   * Mark the time when the progress bar was created.
   */
  const startTime = Date.now();


  /**
   * @private
   *
   * Renders the bar component of a progress bar.
   */
  const renderBaseProgressBar = (width: number, progress: number) => {
    const completeLen = Math.round(progress * width);
    const remainingLen = Math.round((1 - progress) * width);

    let bar = options.symbols.head;

    for (let i = 0; i < completeLen; i++) {
      bar = i === completeLen - 1 && progress !== 1 ? `${bar}${options.symbols.completeHead}` : `${bar}${options.symbols.complete}`;
    }

    for (let i = 0; i < remainingLen; i++) {
      bar = `${bar}${options.symbols.incomplete}`;
    }

    bar = `${bar}${options.symbols.tail}`;

    return bar;
  };


  /**
   * @private
   *
   * Renders elapsed time.
   */
  const renderElapsedTime = () => {
    const elapsedTime = Date.now() - startTime;
    return prettyMs(elapsedTime, options.timeFormat);
  };


  /**
   * @private
   *
   * Renders remaining time.
   */
  const renderRemainingTime = (progress: number) => {
    const elapsedTime = Date.now() - startTime;
    const estimatedTotalTime = elapsedTime / progress;
    const remainingTime = estimatedTotalTime - elapsedTime;

    if (remainingTime !== Number.POSITIVE_INFINITY && remainingTime !== Number.NEGATIVE_INFINITY && !Number.isNaN(remainingTime)) {
      return prettyMs(remainingTime, options.timeFormat);
    }

    return '';
  };


  /**
   * @private
   *
   * Renders percentage.
   */
  const renderPercentage = (progress: number) => {
    const percentComplete = Math.round(progress * 100);
    return `${percentComplete}%`;
  };


  progressBar.toString = () => {
    let progress = options.getProgress();

    if (progress < 0) {
      progress = 0;
    }

    if (progress > 1) {
      progress = 1;
    }

    let output = options.format;

    if (output.includes(':bar')) {
      output = output.replace(':bar', renderBaseProgressBar(options.width, progress));
    }

    if (output.includes(':elapsed')) {
      output = output.replace(':elapsed', renderElapsedTime());
    }

    if (output.includes(':remaining')) {
      output = output.replace(':remaining', renderRemainingTime(progress));
    }

    if (output.includes(':percentage')) {
      output = output.replace(':percentage', renderPercentage(progress));
    }

    return output;
  };


  return progressBar;
}
