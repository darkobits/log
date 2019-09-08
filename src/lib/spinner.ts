import cliSpinners, {SpinnerName} from 'cli-spinners';
import merge from 'deepmerge';
import ow from 'ow';
import {createOrphanedObject} from 'lib/utils';


/**
 * Options object expected by SpinnerFactory and #createSpinner.
 */
export interface SpinnerOptions {
  /**
   * Spinner name to use.
   *
   * See: https://jsfiddle.net/sindresorhus/2eLtsbey/embedded/result/
   *
   * Default: 'dots'
   */
  name?: SpinnerName;
}


/**
 * Object returned by SpinnerFactory and #createSpinner.
 */
export interface Spinner {
  toString(): string;
}


/**
 * Default spinner options.
 */
const DEFAULT_OPTIONS = {
  name: 'dots' as SpinnerName
};


/**
 * Creates a new spinner using the provided options. The returned value may be
 * used directly in an interpolated string.
 */
export default function SpinnerFactory(userSpinnerOptions: SpinnerOptions = {}) {
  const spinner = createOrphanedObject<Spinner>();

  // Merge and validate options.
  const spinnerOptions = merge<Required<SpinnerOptions>>(DEFAULT_OPTIONS, userSpinnerOptions);
  ow(spinnerOptions.name, 'spinner name', ow.string);

  const spinnerInfo = cliSpinners[spinnerOptions.name];

  if (!spinnerInfo) {
    throw new Error(`Invalid spinner name: "${spinnerOptions.name}".`);
  }


  /**
   * @private
   *
   * Mark the time when the spinner was created.
   */
  const startTime = Date.now();


  /**
   * @private
   *
   * Get the list of frames and optimal update interval from cli-spinners.
   */
  const {frames, interval} = spinnerInfo;


  spinner.toString = () => {
    const timeElapsed = Date.now() - startTime;
    const curFrame = Math.floor(timeElapsed / interval) % frames.length;
    return frames[curFrame];
  };


  return spinner;
}
