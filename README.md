<a href="#top" id="top">
  <img src="https://user-images.githubusercontent.com/441546/104720607-e97f5a80-56e1-11eb-89e5-5eee4dc9b17e.png" style="max-width: 100%">
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/log"><img src="https://img.shields.io/npm/v/@darkobits/log.svg?style=flat-square"></a>
  <a href="https://github.com/darkobits/log/actions"><img src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fdarkobits%2Flog%2Fbadge%3Fref%3Dmaster&style=flat-square&label=build&logo=none"></a>
  <a href="https://app.codecov.io/gh/darkobits/log/branch/master"><img src="https://img.shields.io/codecov/c/github/darkobits/log/master?style=flat-square"></a>
  <a href="https://david-dm.org/darkobits/log"><img src="https://img.shields.io/david/darkobits/log.svg?style=flat-square"></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-027dc6.svg?style=flat-square"></a>
</p>

A logger for CLIs. Noop.

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
* Timers
* Spinners
* DEBUG scope support
X Progress Bars

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
