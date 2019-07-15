/**
 * ===== Log History ===========================================================
 *
 * This module provides an API that facilitates writing to a stream where we may
 * want to periodically re-write one or more lines to facilitate interactivity
 * (eg: progress bars). A log history instance may have multiple interactive
 * sessions in progress at the same time.
 */
import os from 'os';
import ansiEscapes from 'ansi-escapes';
import ow from 'ow';
import stripAnsi from 'strip-ansi';
import {createOrphanedObject} from 'lib/utils';


/**
 * Object containing a Symbol that correlates a log line to its interactive
 * session, or `false` if the line was not produced via an interactive session,
 * and the line's content.
 */
export interface LogLine {
  interactiveSessionId: symbol | false;
  content: string;
}


/**
 * Represents the value stored in the streamHandles Map, which is an object
 * containing each stream's original `write` method and an array of LogLines
 * written to it.
 */
export interface StreamHandle {
  originalWrite: Function;
  history: Array<LogLine>;
}


/**
 * Options object accepted by LogHistoryFactory.
 */
export interface LogHistoryOptions {
  stream: NodeJS.WritableStream;
}


/**
 * Object returned by LogHistoryFactory.
 */
export interface LogHistory {
  /**
   * Begins a new interactive session and returns the Symbol representing the
   * session ID.
   */
  beginInteractiveSession(): symbol;

  /**
   * Ends the LogHistory's interactive session.
   */
  endInteractiveSession(id: symbol): void;

  /**
   * Provided an interactive session ID, returns `true` if the provided
   * interactive session ID matches the LogHistory's interactive session ID.
   */
  hasInteractiveSession(id: symbol): boolean;

  /**
   * For a LogHistory with an interactive session, begins an interactive write.
   */
  doInteractiveWrite(id: symbol, cb: () => void): void;

  /**
   * General purpose write method that consumers of a LogHistory instance should
   * use in lieu of the write method of the output stream used to construct the
   * LogHistory instance.
   */
  write(content: string): void;
}


/**
 * @private
 *
 * Singleton map of streams to stream descriptors. This ensures that we do not
 * decorate streams more than once, and that multiple LogHistory instances that
 * are configured with the same output stream will use the same history.
 */
const streamHistories = new Map<NodeJS.WritableStream, StreamHandle>();


export default function LogHistoryFactory(opts: LogHistoryOptions) {
  /**
   * Log history instance.
   */
  const logHistory = createOrphanedObject<LogHistory>();


  /**
   * @private
   *
   * Temporary record of erased lines that will need to be re-written at the
   * end of an interactive write.
   */
  let truncatedLines: Array<LogLine> = [];


  /**
   * @private
   *
   * Tracks whether an interactive session is ongoing.
   */
  let interactiveSessionIds: Array<symbol> = [];


  /**
   * @private
   *
   * Tracks whether a write to the logger during an interactive session is
   * a standard write or an interactive write.
   */
  let interactiveWriteId: symbol | false = false;


  /**
   * @private
   *
   * Object containing the un-decorated write method and history for our output
   * stream.
   */
  let streamHandle: StreamHandle;


  // ----- Private Methods -----------------------------------------------------

  /**
   * @private
   *
   * Returns `true` if the last entry in the history array ends with an EOL
   * character.
   */
  function lastEntryIsCompleteLine() {
    if (streamHandle.history.length === 0) {
      return true;
    }

    const lastItemContent = streamHandle.history[streamHandle.history.length - 1].content;
    return stripAnsi(lastItemContent).endsWith(os.EOL);
  }


  /**
   * @private
   *
   * Erases the provided number of lines in our output stream.
   */
  function eraseLines(numLines = 1) {
    streamHandle.originalWrite(ansiEscapes.eraseLines(numLines + 2));
  }


  /**
   * @private
   */
  function decorateOutputStream(stream: NodeJS.WritableStream) {
    const originalWrite = opts.stream.write.bind(opts.stream);

    // @ts-ignore
    opts.stream.write = (...args: Array<any>) => {
      const chunk = args[0];

      if (typeof chunk === 'string') {
        if (chunk === '') {
          return;
        }

        updateHistory(false, chunk);
      }

      Reflect.apply(originalWrite, opts.stream, args);
    };

    return originalWrite;
  }


  /**
   * @private
   *
   * Returns the first interactive log line with an ID matching the provided ID.
   * If no ID was provided, returns the first interactive log line.
   */
  function getFirstInteractiveIndex(id?: symbol) {
    return streamHandle.history.findIndex(logLine => {
      if (id !== undefined) {
        return logLine.interactiveSessionId !== false;
      }

      return logLine.interactiveSessionId === id;
    });
  }


  /**
   * @private
   *
   * Responsible for accepting an incoming string that was written to the logger
   * and writing each individual line to our history array as a LogLine tuple
   * with the correct interactive session ID.
   */
  function updateHistory(interactiveSessionId: symbol | false, lineContent: string) {
    // If there are no ongoing interactive sessions, we do not need to write
    // anything to our history.
    if (interactiveSessionIds.length === 0) {
      return;
    }

    // Split the incoming string to separate lines.
    const matches = lineContent.match(new RegExp(`.*(\\${os.EOL})?`, 'g'));

    if (!matches) {
      throw new Error('Unexpexted Error: Unable to split content into lines.');
    }

    // If the last character in `content` is not an EOL, we can get a stray ''.
    // If so, remove it from the list of matches.
    if (matches[matches.length - 1] === '') {
      matches.pop();
    }

    let lines: Array<string> = [];

    if (lastEntryIsCompleteLine()) {
      // If the last entry in our history ends with an EOL, then we will simply
      // add each incoming line to the end of our history (below).
      lines = matches;
    } else {
      // Otherwise, append the first line to the content of the last LogLine in
      // our history, then append each additional line (below).
      const [first, ...rest] = matches;
      streamHandle.history.slice(-1)[0].content = `${streamHandle.history.slice(-1)[0].content}${first}`;
      lines = rest;
    }

    // Append lines to history using the provided interactive session ID.
    lines.forEach(content => {
      streamHandle.history.push({interactiveSessionId, content});
    });
  }


  // ----- Public Methods ------------------------------------------------------

  logHistory.beginInteractiveSession = () => {
    const interactiveSessionId = Symbol();
    interactiveSessionIds.push(interactiveSessionId);
    return interactiveSessionId;
  };


  logHistory.endInteractiveSession = id => {
    ow(id, 'id', ow.symbol);

    if (!interactiveSessionIds.includes(id)) {
      throw new Error('Unknown interactive session ID.');
    }

    // At the end of an interactive session, mark all lines in our history
    // related to the current session as non-interactive.
    streamHandle.history = streamHandle.history.map(({interactiveSessionId, content}) => ({
      interactiveSessionId: interactiveSessionId === id ? false : interactiveSessionId,
      content
    }));


    // Remove the provided ID from our list of interactive session IDs.
    interactiveSessionIds = interactiveSessionIds.filter(curId => curId !== id);

    // If we are ending the last outstanding interactive session, we can safely
    // truncate our history array.
    if (interactiveSessionIds.length === 0) {
      streamHandle.history = [];
    }
  };


  logHistory.hasInteractiveSession = id => {
    ow(id, 'id', ow.symbol);
    return interactiveSessionIds.includes(id);
  };


  logHistory.doInteractiveWrite = (id, cb) => {
    ow(id, 'id', ow.symbol);
    ow(cb, 'callback', ow.function);

    // Ensure we were provided a valid/known interactive session ID.
    if (!interactiveSessionIds.includes(id)) {
      throw new Error('Unknown interactive session ID.');
    }

    // Ensures that only 1 interactive write is active at a time.
    if (interactiveWriteId) {
      throw new Error('Only 1 interactive write allowed at a time.');
    }

    interactiveWriteId = id;

    // Find the index of the first LogLine in our history that matches the
    // provided interactive session ID.
    const firstInteractiveIndex = getFirstInteractiveIndex(id);

    if (firstInteractiveIndex !== -1) {
      // If we found a line matching the provided session ID, gather a list of
      // all lines after it that do not match the provided ID. These lines will
      // be erased, and we will need to re-write them to the output stream after
      // the interactive write.
      truncatedLines = streamHandle.history.slice(firstInteractiveIndex).filter(logLine => logLine.interactiveSessionId !== id);

      // Erase our output stream back to the line just before the first
      // interactive line matching the provided ID.
      eraseLines(streamHandle.history.length - firstInteractiveIndex - 1);

      // Reset our history to match the state of the output stream.
      streamHandle.history = streamHandle.history.slice(0, firstInteractiveIndex);
    }

    // Invoke the provided callback, which should perform the write operation by
    // calling our #write method.
    cb();

    interactiveWriteId = false;

    // Re-apply all truncated lines that were erased.
    truncatedLines.forEach(logLine => {
      streamHandle.originalWrite(logLine.content);
      streamHandle.history.push(logLine);
    });

    truncatedLines = [];
  };


  logHistory.write = content => {
    ow(content, 'content', ow.string);
    updateHistory(interactiveWriteId, content);
    streamHandle.originalWrite(content);
  };


  // ----- Init ----------------------------------------------------------------

  if (!streamHistories.has(opts.stream)) {
    const originalWrite = decorateOutputStream(opts.stream);
    streamHistories.set(opts.stream, {originalWrite, history: []});
  }

  // @ts-ignore
  streamHandle = streamHistories.get(opts.stream);


  return logHistory;
}
