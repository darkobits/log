import merge from 'deepmerge';
import ow from 'ow';
import prettyMs from 'pretty-ms';
import {createOrphanedObject} from 'lib/utils';


export type TimerOptions = prettyMs.Options;


/**
 * Object returned by #.createTimer.
 */
export interface Timer {
  /**
   * Resets the elapsed time of the timer to zero.
   */
  reset(): void;

  toString(): string;
}


/**
 * Default timer formatting options.
 */
const DEFAULT_OPTIONS: TimerOptions = {
  secondsDecimalDigits: 0
};


/**
 * Creates a new timer using the provided options. The returned value may be
 * used directly in an interpolated string.
 */
export default function TimerFactory(userTimerOptions: TimerOptions = {}) {
  const timer = createOrphanedObject<Timer>();

  // Merge and validate options.
  const timerOptions = merge<Required<TimerOptions>>(DEFAULT_OPTIONS, userTimerOptions);
  ow(timerOptions.secondsDecimalDigits, 'secondsDecimalDigits', ow.any(ow.undefined, ow.number.integer.greaterThanOrEqual(0)));
  ow(timerOptions.millisecondsDecimalDigits, 'millisecondsDecimalDigits', ow.any(ow.undefined, ow.number.integer.greaterThanOrEqual(0)));
  ow(timerOptions.keepDecimalsOnWholeSeconds, 'keepDecimalsOnWholeSeconds', ow.any(ow.undefined, ow.boolean));
  ow(timerOptions.compact, 'compact', ow.any(ow.undefined, ow.boolean));
  ow(timerOptions.unitCount, 'unitCount', ow.any(ow.undefined, ow.number.integer.greaterThanOrEqual(0)));
  ow(timerOptions.verbose, 'verbose', ow.any(ow.undefined, ow.boolean));
  ow(timerOptions.separateMilliseconds, 'separateMilliseconds', ow.any(ow.undefined, ow.boolean));
  ow(timerOptions.formatSubMilliseconds, 'formatSubMilliseconds', ow.any(ow.undefined, ow.boolean));


  /**
   * @private
   *
   * Mark the time when the spinner was created.
   */
  let startTime = Date.now();


  timer.reset = () => {
    startTime = Date.now();
  };


  timer.toString = () => {
    return prettyMs(Date.now() - startTime, timerOptions);
  };


  return timer;
}