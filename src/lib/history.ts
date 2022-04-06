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


// ----- Private Globals -------------------------------------------------------

/**
 * @private
 *
 * Singleton map of streams to stream descriptors. This ensures that we do not
 * decorate streams more than once, and that multiple LogHistory instances that
 * are configured with the same output stream will use the same history.
 */
const streamHistories = new Map<NodeJS.WritableStream | false, StreamHandle>();


/**
 * @private
 *
 * Counter used when creating Symbols for interactive session IDs. Mostly useful
 * for debugging purposes.
 */
let interactiveSessionIdCounter = 0;


// ----- Types -----------------------------------------------------------------

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
  originalWrite: (...args: Array<any>) => any;
  history: Array<LogLine>;
  interactiveSessionIds: Array<symbol>;
}


/**
 * Options object accepted by LogHistoryFactory.
 */
export interface LogHistoryOptions {
  stream: NodeJS.WritableStream | false;
}


/**
 * Object returned by LogHistoryFactory.
 */
export interface LogHistory {
  /**
   * Update the stream that the ledger writes to.
   */
  setStream(newStream: NodeJS.WritableStream | false): void;

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


// ----- Log History -----------------------------------------------------------

export default function LogHistoryFactory(opts: LogHistoryOptions) {
  /**
   * Log history instance.
   */
  const logHistory = createOrphanedObject<LogHistory>();

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
  const lastEntryIsCompleteLine = () => {
    if (streamHandle.history.length === 0) {
      return true;
    }

    const lastItemContent = streamHandle.history[streamHandle.history.length - 1].content;
    return stripAnsi(lastItemContent).endsWith(os.EOL);
  };


  /**
   * @private
   *
   * Responsible for accepting an incoming string that was written to the logger
   * and writing each individual line to our history array as a LogLine tuple
   * with the correct interactive session ID.
   */
  const updateHistory = (interactiveSessionId: symbol | false, lineContent: string) => {
    // If there are no ongoing interactive sessions, we do not need to write
    // anything to our history.
    if (streamHandle.interactiveSessionIds.length === 0) {
      return;
    }

    // Split the incoming string to separate lines.
    // const matches = lineContent.match();
    const matches = new RegExp(`.*(\\${os.EOL})?`, 'g').exec(lineContent);

    if (!matches) {
      throw new Error('Unexpected Error: Unable to split content into lines.');
    }

    // If the last character in `content` is not an EOL, we can get a stray ''.
    // If so, remove it from the list of matches.
    if (matches[matches.length - 1] === '') {
      matches.pop();
    }

    matches.forEach(content => {
      if (lastEntryIsCompleteLine()) {
        streamHandle.history.push({interactiveSessionId, content});
      } else {
        const lastEntry = streamHandle.history.slice(-1)[0];
        lastEntry.content = `${lastEntry.content}${content}`;
      }
    });
  };


  /**
   * @private
   *
   * Decorates the `write` method of the configured writable stream such that
   * any writes thereto will be captured in our history.
   */
  const decorateOutputStream = (stream: NodeJS.WritableStream | false) => {
    if (stream === false) {
      return (...args: Array<any>) => {
        const cb = args.pop();
        cb();
        return true;
      };
    }

    const originalWrite = stream.write.bind(stream);

    // @ts-ignore
    stream.write = (chunk: any, cb?: ((err?: Error | null | undefined) => void)) => {
      updateHistory(false, Buffer.from(chunk).toString('utf8'));
      return Reflect.apply(originalWrite, stream, [chunk, cb]);
    };

    return originalWrite;
  };


  /**
   * @private
   *
   * Returns the index of the first interactive log line with an ID matching the
   * provided ID. If no ID is provided, returns the first interactive log line.
   */
  const getFirstInteractiveIndex = (id?: symbol) => {
    return streamHandle.history.findIndex(logLine => {
      if (id === undefined) {
        return logLine.interactiveSessionId !== false;
      }

      return logLine.interactiveSessionId === id;
    });
  };


  // ----- Public Methods ------------------------------------------------------

  logHistory.setStream = newStream => {
    if (!streamHistories.has(newStream)) {
      const originalWrite = decorateOutputStream(newStream);
      streamHistories.set(newStream, {
        originalWrite,
        history: [],
        interactiveSessionIds: []
      });
    }

    // @ts-ignore
    streamHandle = streamHistories.get(newStream);
  };


  logHistory.beginInteractiveSession = () => {
    const interactiveSessionId = Symbol(`${++interactiveSessionIdCounter}`);
    streamHandle.interactiveSessionIds.push(interactiveSessionId);
    return interactiveSessionId;
  };


  logHistory.endInteractiveSession = id => {
    ow(id, 'id', ow.symbol);

    if (!streamHandle.interactiveSessionIds.includes(id)) {
      throw new Error('Unknown interactive session ID.');
    }

    // At the end of an interactive session, mark all lines in our history
    // related to the current session as non-interactive.
    streamHandle.history = streamHandle.history.map(({interactiveSessionId, content}) => ({
      interactiveSessionId: interactiveSessionId === id ? false : interactiveSessionId,
      content
    }));


    // Remove the provided ID from our list of interactive session IDs.
    streamHandle.interactiveSessionIds = streamHandle.interactiveSessionIds.filter(curId => curId !== id);

    // If we are ending the last outstanding interactive session, we can safely
    // truncate our history array.
    if (streamHandle.interactiveSessionIds.length === 0) {
      streamHandle.history = [];
    }
  };


  logHistory.hasInteractiveSession = id => {
    ow(id, 'id', ow.symbol);
    return streamHandle.interactiveSessionIds.includes(id);
  };


  logHistory.doInteractiveWrite = (id, cb) => {
    ow(id, 'id', ow.symbol);
    ow(cb, 'callback', ow.function);

    // Ensure we were provided a valid/known interactive session ID.
    if (!streamHandle.interactiveSessionIds.includes(id)) {
      throw new Error('Unknown interactive session ID.');
    }

    // Ensures that only 1 interactive write is active at a time.
    if (interactiveWriteId) {
      throw new Error('Only 1 interactive write allowed at a time.');
    }

    interactiveWriteId = id;
    streamHandle.originalWrite(ansiEscapes.cursorHide);

    // Find the index of the first LogLine in our history that matches the
    // provided interactive session ID.
    const firstInteractiveIndex = getFirstInteractiveIndex(id);

    // This array will hold the state of the history array prior to the
    // re-write. We will use it to determine which truncated lines need to be
    // erased and re-written following the interactive re-write.
    let oldStreamHistory: Array<LogLine> = [];

    // This array will hold all truncated log lines that will need to be
    // re-written to the canonical history, and possibly to the output stream
    // (if they changed) following the interactive re-write.
    let truncatedLines: Array<LogLine> = [];

    if (firstInteractiveIndex !== -1) {
      // Capture the current state of the stream history prior to performing the
      // re-write.
      oldStreamHistory = streamHandle.history;

      // If we found a line matching the provided session ID, gather a list of
      // all lines after it that do not match the provided ID. These lines will
      // be erased, and we will need to re-write them to the output stream after
      // the interactive write.
      truncatedLines = streamHandle.history.slice(firstInteractiveIndex).filter(logLine => logLine.interactiveSessionId !== id);

      // Reset the canonical stream history by deleting entries back to (and
      // including) the interactive line(s) that is to be re-written.
      streamHandle.history = streamHandle.history.slice(0, firstInteractiveIndex);

      // Move the cursor back to the first interactive line that we need to
      // re-write.
      streamHandle.originalWrite(ansiEscapes.cursorUp(oldStreamHistory.length - firstInteractiveIndex));
    }

    // Invoke the provided callback, which should perform the write operation by
    // calling our #write method. This will also append the new interactive
    // lines to our history _and_ write them to our stream.
    cb();

    if (truncatedLines.length > 0) {
      // Create an index we will use in our pre-rewrite history array that
      // points to the line that lies where the cursor is positioned now; just
      // below the last line that was produced during the interactive re-write.
      let historicalIndex = firstInteractiveIndex + streamHandle.history.length;

      // For each line in our truncated lines list, compare the truncated line
      // to the line in our pre-rewrite history. If they match, we do not need
      // to re-write the line in our output stream, and can simply re-add it to
      // the canonical history and move on to the next line. If they do not
      // match, we need to erase the current line in the output stream and
      // replace it with the truncated line.
      for (const truncatedLine of truncatedLines) { // tslint:disable-line prefer-for-of
        const oldLine = oldStreamHistory[historicalIndex];

        if (!oldLine || oldLine !== truncatedLine) {
          streamHandle.originalWrite(ansiEscapes.eraseLine);
          streamHandle.originalWrite(truncatedLine.content);
        } else {
          streamHandle.originalWrite(ansiEscapes.cursorDown(1));
        }

        streamHandle.history.push(truncatedLine);
        ++historicalIndex;
      }
    }

    interactiveWriteId = false;
    streamHandle.originalWrite(ansiEscapes.cursorShow);
  };


  logHistory.write = content => {
    ow(content, 'content', ow.string);
    updateHistory(interactiveWriteId, content);

    if (interactiveWriteId) {
      streamHandle.originalWrite(ansiEscapes.eraseLine);
    }

    streamHandle.originalWrite(content);
  };


  // ----- Init ----------------------------------------------------------------

  logHistory.setStream(opts.stream);

  return logHistory;
}
