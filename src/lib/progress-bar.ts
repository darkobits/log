import merge from 'deepmerge';
import ow from 'ow';
import prettyMs from 'pretty-ms';
import {createOrphanedObject} from 'lib/utils';


/**
 * Options object accepted by ProgressBarFactory.
 */
export interface ProgressBarOptions {
  format?: string;
  width?: number;
  timeFormat?: prettyMs.Options;
  symbols?: {
    head?: string;
    tail?: string;
    incomplete?: string;
    complete?: string;
    completeHead?: string;
  };
  getProgress(): number;
}

/**
 * Object returned by ProgressBarFactory.
 */
export interface ProgressBar {
  toString(): string;
}


/**
 * Default progress bar options.
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
  function renderBaseProgressBar(width: number, progress: number) {
    const completeLen = Math.round(progress * width);
    const remainingLen = Math.round((1 - progress) * width);

    let bar = options.symbols.head;

    for (let i = 0; i < completeLen; i++) {
      if (i === completeLen - 1 && progress !== 1) {
        bar = `${bar}${options.symbols.completeHead}`;
      } else {
        bar = `${bar}${options.symbols.complete}`;
      }
    }

    for (let i = 0; i < remainingLen; i++) {
      bar = `${bar}${options.symbols.incomplete}`;
    }

    bar = `${bar}${options.symbols.tail}`;

    return bar;
  }


  /**
   * @private
   *
   * Renders elapsed time.
   */
  function renderElapsedTime() {
    const elapsedTime = Date.now() - startTime;
    return prettyMs(elapsedTime, options.timeFormat);
  }


  /**
   * @private
   *
   * Renders remaining time.
   */
  function renderRemainingTime(progress: number) {
    const elapsedTime = Date.now() - startTime;
    const estimatedTotalTime = elapsedTime / progress;
    const remainingTime = estimatedTotalTime - elapsedTime;

    if (remainingTime !== Infinity && remainingTime !== -Infinity && !isNaN(remainingTime)) {
      return prettyMs(remainingTime, options.timeFormat);
    }

    return '';
  }


  /**
   * @private
   *
   * Renders percentage.
   */
  function renderPercentage(progress: number) {
    const percentComplete = Math.round(progress * 100);
    return `${percentComplete}%`;
  }


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
