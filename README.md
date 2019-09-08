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

A logger for CLIs.

## Contents

* [Features](#features)
* [Install](#install)
* [Basic Usage](#basic-usage)
* [API](#api)
  * [`.chalk`](#chalk)
  * [`#configure`](#configureconfig-partiallogoptions-void)
  * [`#getLevel`](#getlevel-leveldescriptor)
  * [`#getLevels`](#getlevels-key-string-leveldescriptor)
  * [`#isLevelAtLeast`](#islevelatleastname-string-boolean)
  * [`#prefix`](#prefixprefix-primitive-prefix)
  * [`#addSecret`](#addsecretsecret-primitive--regexp-maskchar---void)
  * [`#createPipe`](#createpipelevel-string-nodejswritablestream)
  * [`#beginInteractive`](#begininteractivemessagefn--begininteractiveoptions-endinteractivefn)
  * [`#createTimer`](#createtimeroptions-timeroptions-timer)
  * [`#createProgressBar`](#createprogressbaroptions-progressbaroptions-progressbar)
  * [`#createSpinner`](#createspinneroptions-spinneroptions-spinner)
* [Debug Support](#debug-support)
* [Caveats](#caveats)

## Features

* Highly Configurable
* Chalk-included
* Interactive Mode
* Timers
* Spinners
* Progress Bars

## Install

```
$ npm i @darkobits/log
```

## Basic Usage

This package's default export is a factory function that accepts an [options object](/src/etc/types.ts#L119-L189).

If the `level` option is omitted, the log level will be set to `process.env.LOG_LEVEL` if set. Otherwise, it will be set to `info`.

**Example:**

```ts
import LogFactory from '@darkobits/log';

const log = LogFactory({heading: 'myApp'});

log.info(`Now you're thinking with ${log.chalk.bold('Portals')}!`);
```

<p align="center">
  <img src="https://user-images.githubusercontent.com/441546/64509568-ddd18780-d294-11e9-961a-16f1f203db20.png" max-width="100%">
</p>

## API

This section documents the properties and methods of each logger instance. The examples below assume a logger (referred to as `log`) has already been created.

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>
<h3><code>.chalk</code></h3>

To afford a convenient way to style log messages, the logger creates a custom [Chalk](https://github.com/chalk/chalk) instance for each logger, the options for which are configurable. By creating a custom Chalk instance, the logger avoids conflicting with the default/global Chalk instance that may be in use by other parts of an application.

**Example:**

```ts
log.info(`Have a ${log.chalk.bold.pink('fabulous')} day!`);
```

<p align="center">
  <img src="https://user-images.githubusercontent.com/441546/64509839-7831cb00-d295-11e9-9993-4bb65e1d0a9c.png" max-width="100%">
</p>

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>
<h3><code>configure(config: Partial<<a href="/src/etc/types.ts#L119-L189">LogOptions</a>>): void</code></h3>

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
<h3><code>getLevel(): <a href="/src/etc/types.ts#L37-L57">LevelDescriptor</a></code></h3>

Returns a `LevelDescriptor` object for the current log level.

**Example:**

Assuming the current level is `info`:

```ts
const curLevel = log.getLevel();

curLevel.label //=> 'info'
curLevel.level //=> 6000
curLevel.style //=> StyleFunction
```

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>
<h3><code>getLevels(): {[key: string]: <a href="/src/etc/types.ts#L37-L57">LevelDescriptor</a>}</code></h3>

Returns an object mapping log level names (ex: `info`) to `LevelDescriptor` objects for each configured level. Note: The logger does not implement a method for the `silent` level.

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>
<h3><code>isLevelAtLeast(name: string): boolean</code></h3>

Returns `true` if a message written at the provided log level would be written to the output stream based on the current log level.

**Example:**

```ts
log.configure({level: 'info'});
log.isLevelAtLeast('error') //=> true
log.isLevelAtLeast('silly') //=> false
```

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>
<h3><code>prefix(prefix: <a href="/src/etc/types.ts#L10-L13">Primitive</a>): <a href="/src/etc/types.ts#L66-L75">Prefix</a></code></h3>


Applies a prefix, styled according to the logger's `style.prefix` options, to each line written to the output stream for the current call.

**Example:**

```ts
log.info(log.prefix('someFunction'), 'Hello\nworld.');
```

<p align="center">
  <img src="https://user-images.githubusercontent.com/441546/64510094-20e02a80-d296-11e9-88fe-a04099676c25.png" max-width="100%">
</p>

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>
<h3><code>addSecret(secret: <a href="/src/etc/types.ts#L10-L13">Primitive</a> | RegExp, maskChar = '*'): void</code></h3>

This method may be used to ensure passwords and other sensitive information are not inadvertently written to the output stream. It accepts either a string literal or a regular expression and an optional mask character. By default, secrets are masked using `*`.

**Example:**

```ts
const user = {
  name: 'Frodo',
  password: 'shire'
};

log.addSecret(user.password);
log.info('User data:', user);
```

<p align="center">
  <img src="https://user-images.githubusercontent.com/441546/64510491-24c07c80-d297-11e9-935a-3e1f2cb4e38e.png" max-width="100%">
</p>

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>
<h3><code>createPipe(level: string): <a href="https://nodejs.org/api/stream.html#stream_writable_streams">NodeJS.WritableStream</a></code></h3>

Creates a writable stream that will output any data written to it as log messages at the indicated level. Useful for displaying the output of a child process, for example.

In the following example, all output written to `process.stderr` by the child process will be written as log messages at the `verbose` level.

**Example:**

```ts
import execa from 'execa';

log.info('Starting child process...');

const childProcess = execa('echo', ['"I am a banana!"'], {stdout: 'pipe'});
childProcess.stdout.pipe(log.createPipe('verbose'));

await childProcess;

log.info('Done.');
```

<p align="center">
  <img src="https://user-images.githubusercontent.com/441546/64511027-466e3380-d298-11e9-8dd7-a496cd7a459c.png" max-width="100%">
</p>

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>
<h3><code>beginInteractive(<a href="/src/etc/types.ts#L80-L85">MessageFn</a> | <a href="/src/etc/types.ts#L88-L100">BeginInteractiveOptions</a>): <a href="/src/etc/types.ts#L98">EndInteractiveFn</a></code></h3>

Begins a new interactive session and returns a function that may be invoked to end the interactive session. This method accepts either an options object or a function that will be invoked to render each update during the interactive session. If a custom interval is not being used, the shorthand (message function only) form is recommended.

The function returned by `beginInteractive` accepts a function that will be invoked to produce the final content written to the interactive line(s).

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
<h3><code>createTimer(options?: <a href="https://github.com/sindresorhus/pretty-ms/blob/master/index.d.ts#L2-L64">TimerOptions</a>): <a href="/src/lib/timer.ts#L15-L28">Timer</a></code></h3>

Creates a timer (chronograph) that starts immediately. The timer object may be placed directly into an interpolated string literal and will render its current value. Formatting is facilitated using [`pretty-ms`](https://github.com/sindresorhus/pretty-ms), and this method's options are identical to those of `pretty-ms`.

Additionally, the timer object has a `#reset()` method that may be invoked to reset the timer to zero.

**Example:**

```ts
const timer = log.createTimer();

// Some time later...

log.info(`Done in ${timer}.`);
```

> screenshot(s) here.

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>
<h3><code>createProgressBar(options: <a href="/src/lib/progress-bar.ts#L7-L88">ProgressBarOptions</a>): <a href="/src/lib/progress-bar.ts#L91-L96">ProgressBar</a></code></h3>

Creates a progress bar. The progress bar object may be placed directly into an interpolated string literal and will render its current value. The only required option for this method is `getProgress`, a function that will be invoked every time the progress bar is rendered, and should return a number between `0` and `1` indicating how full the bar should be.

**Example:**

```ts
import axios from 'axios';

let completed = 0;

const progressBar = log.createProgressBar({
  // `getProgress` can simply return the value of `completed`.
  getProgress: () => completed
});

// Begin an interactive session that will continuously render our progress bar
// while the download is outstanding.
const endInteractive = log.beginInteractive(() => log.info(`Downloading file: ${progressBar}`));

// Download a file with Axios.
const download = await axios({
  url: 'https://my.domain.com/some-file.zip',
  onDownloadProgress: (progressEvent) => {
    // On each progress event, update our `completed` variable.
    completed = progressEvent.loaded / progressEvent.total;
  }
});

// Finally, end our interactive session.
endInteractive(() => log.info('Download complete.'));
```

<a href="#top"><img src="https://user-images.githubusercontent.com/441546/63230477-f5e84680-c1c1-11e9-8c2d-6d2079cee662.png"></a>
<h3><code>createSpinner(options?: <a href="/src/lib/spinner.ts#L7-L19">SpinnerOptions</a>): <a href="/src/lib/spinner.ts#L22-L27">Spinner</a></code></h3>

Creates a spinner. The spinner object may be placed directly into an interpolated string literal and will render its current value. The only option this method accepts is `name`, which should be a valid [`cli-spinners`](https://github.com/sindresorhus/cli-spinners) [spinner name](https://jsfiddle.net/sindresorhus/2eLtsbey/embedded/result/). If no options are provided, the `dots` spinner will be used.

**Example:**

```ts
const spinner = log.createSpinner();

const endInteractive = log.beginInteractive(() => log.info(`${spinner} Reticulating splines...`));

// Once all splines have been reticulated...

endInteractive(() => log.info(`Done.`));
```

## Debug Support

...

## Caveats

...

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>
