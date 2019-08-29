<a href="#top" id="top">
  <img src="https://user-images.githubusercontent.com/441546/41699021-76157614-74d6-11e8-9ad0-13708b41176e.png" style="max-width: 100%">
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/log"><img src="https://img.shields.io/npm/v/@darkobits/log.svg?style=flat-square"></a>
  <a href="https://github.com/darkobits/log/actions"><img src="https://img.shields.io/endpoint?url=https://aws.frontlawn.net/ga-shields/darkobits/log&style=flat-square"></a>
  <a href="https://www.codacy.com/app/darkobits/log"><img src="https://img.shields.io/codacy/coverage/b64cfd79c4994acf8b31ff10b6d0ac87.svg?style=flat-square"></a>
  <a href="https://david-dm.org/darkobits/log"><img src="https://img.shields.io/david/darkobits/log.svg?style=flat-square"></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-FB5E85.svg?style=flat-square"></a>
</p>

A logger suitable for CLIs.


## Table of Contents

* Install
* Basic Usage
* Debug Support
* API
* Caveats

## Install

```
$ npm i @darkobits/log
```

## Basic Usage

This package's default export is a factory function that accepts an [options object](/src/etc/types.ts#L42-L73).

If the `level` option is omitted, the log level will be set to `process.env.LOG_LEVEL` if set. Otherwise, it will be set to `info`.

**Example:**

> `my-app.ts`

```ts
import LogFactory from '@darkobits/log';

const log = LogFactory({heading: 'myApp'});

function doStuff() {
  log.info('doStuff', `Now you're thinking with ${log.chalk.bold('Portals')}!`);
}
```

## API

This section documents the properties and methods of each logger instance. The examples below assume a logger (referred to as `log`) has already been created.

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>

### `.chalk`

Reference to the [chalk](https://github.com/chalk/chalk) instance created by the logger. The logger creates a custom chalk instance for configurability and to avoid onflicting with the global instance.

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>

### `configure(config: Partial<LogOptions>): void`

Configure/re-configure the logger instance. The provided object will be deep-merged with the logger's existing configuration. This method can therefore be used to accomplish things like:

* Adding log levels.
* Changing the styling for existing log levels and other tokens.
* Changing the log level.

**Example:**

```ts
// Change the log level.
log.configure({level: 'verbose'});

// Add a new log level.
log.configure({
  levels: {
    foo: {
      level: 5000,
      label: 'FOO!',
      style: (token, chalk) => chalk.keyword('blue')(token)
    }
  }
});
```

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>

### `getLevel(): LevelDescriptor`

Returns a [`LevelDescriptor`](/src/etc/types.ts) object for the current log level.

**Example:**

Assuming the current level is `info`:

```ts
const curLevel = log.getLevel();

curLevel.label //=> 'info'
curLevel.level //=> 6000
curLevel.style //=> StyleFunction
```

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>

### `getLevels(): {[key: string]: LevelDescriptor}`

Returns an object mapping log level names (ex: `info`) to `LevelDescriptor` objects for each configured level. Note: The logger does not implement a method for the `silent` level.

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>

### `isLevelAtLeast(name: string): boolean`

Returns `true` if a message written at the provided log level would be written to the output stream based on the current log level.

**Example:**

```ts
log.configure({level: 'info'});
log.isLevelAtLeast('error') //=> true
log.isLevelAtLeast('silly') //=> false
```

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>

### `prefix(prefix: string | number | boolean): Prefix`

Applies a prefix, styled according to the logger's `style.prefix` options, to each line written to the output stream for the current call.

**Example:**

```ts
log.info(log.prefix('someFunction'), 'Hello\nworld.');
```

> screenshot(s) here.

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>

### `addSecret(secret: string | RegExp, maskChar = '*'): void`

This method may be used to ensure passwords and other sensitive information are not inadvertently written to the output stream. It accepts either a string literal or a regular expression. By default, secrets are masked using the `*` character.

**Example:**

```ts
const user = {
  name: 'Frodo',
  password: 'shire'
};

log.addSecret(user.password);
```

> screenshot(s) here.

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>

### `createPipe(level: string): NodeJS.WritableStream`

Creates a writable stream that will output any data as messages at the indicated log level. Useful for displaying the output of a child process, for example.

In the following example, all output written to stderr by the child process will be written as log messages at the `verbose` level.

**Example:**

```ts
import execa from 'execa';

log.info('Starting child process...');
const childProcess = execa('echo "foo"', {stderr: 'pipe'});
childProcess.stderr.pipe(log.createPipe('verbose'));
await childProcess;
log.info('Done.');
```

> screenshot(s) here.

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>

### `beginInteractive(): Function`

Begins a new interactive session and returns a function that may be invoked to end the interactive session. This method accepts an options object with the following shape:

**Example:**

```ts
interface BeginInteractiveOptions {
  /**
   * Function that will be called to render each frame/update during the session. This
   * function should call one or more log methods to produce the desired output.
   */
  message: () => any;

  /**
   * (Optional) Number of milliseconds between frames/updates.
   *
   * Default: 1000 / 30
   */
  interval?: number;
}
```

If not using a custom update interval, this method may be passed the `message` function as its single argument.

**Example:**

```ts
const spinner = log.createSpinner();
const time = log.createTimer();
const endInteractive = log.beginInteractive(() => log.info(`${spinner} Please stand by...`));

// Some time later...

endInteractive(() => log.info(`Done in ${time}.`));
```

> screenshot(s) here

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>

### `createTimer(options?: TimerOptions): Timer`

Creates a timer/stopwatch that starts immediately. The timer object may be placed directly into an interpolated string literal and will render its current value. Formatting is facilitated using [`pretty-ms`](https://github.com/sindresorhus/pretty-ms). This method's options are identical to those of `pretty-ms`.

Additionally, the timer object has a `reset()` method that may be invoked to reset the timer to zero.

**Example:**

```ts
const timer = log.createTimer();

// Some time later...

log.info(`Done in ${timer}.`);
```

> screenshot(s) here.

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>

### `createProgressBar(options: ProgressBarOptions): ProgressBar`

Creates a progress bar according to the provided options. The only required option is `getProgress`, a function that will be invoked every time the progress bar is rendered, and should return a number between `0` and `1`.





## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>
