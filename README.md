[![][npm-img]][npm-url] [![][travis-img]][travis-url] [![][david-img]][david-url] [![][david-dev-img]][david-dev-url] [![][cc-img]][cc-url] [![][xo-img]][xo-url]

# log

A thin wrapper around the wonderful [`npmlog`](https://github.com/npm/npmlog) that creates unique instances.

## Installation

```bash
$ npm install --save @darkobits/log
```

## Usage

This package's default export is a factory function with the following signature:

|Parameter|Type|Description|
|---|---|---|
|`heading`|`string`|(Optional) Log heading to set.|
|`level`|`string`|(Optional) Log level to set.|

Log level will be set to `process.env.LOG_LEVEL` if set. Otherwise, it will use the `npmlog` default level, `info`.

**Example:**

> `foo.js`

```js
import LogFactory from '@darkobits/log';

// For convenience, you can set the heading and/or level via the factory function.
const log = LogFactory('foo', 'silly');

export default function init() {
  log.silly('init', 'Hello, there!');
}

```

Using `npmlog` alone, `bar.js` below would wind up importing the same object imported by `foo.js`, with its `heading` and `level` already set. Even worse, if `bar.js` changes them and then `foo.js` logs something, the resulting output will be completely [hosed](https://www.youtube.com/embed/hdBBq56T_Gc?autoplay=1&rel=0&modestbranding=1).


> `bar.js`

```js
import LogFactory from '@darkobits/log';

const log = LogFactory();

// You may also set the heading via the 'heading' property, per usual.
log.heading = 'bar';

export default function barnacles() {
  log.info('barnacles', 'Aw, shucks!');
}
```

With this setup, we can now do the following:

> `baz.js`

```js
import init from './foo';
import barnacles from './bar';

barnacles();
init();
```

And get the following output:

![bar](https://user-images.githubusercontent.com/441546/32649476-f9b915ca-c5ae-11e7-8bc8-9d7e2542640e.jpg)
![foo](https://user-images.githubusercontent.com/441546/32649473-f5303614-c5ae-11e7-871f-b7c8321ffd7c.jpg)

## Why?

`npmlog` is great, but it was designed to be used by one package at a time. When there are multiple packages that depend on `npmlog` in the same execution context, things get wonky rather quickly. This package guarantees that each `import` gets its own instance with its own state that it can customize as it sees fit.

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>

[npm-img]: https://img.shields.io/npm/v/@darkobits/log.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@darkobits/log

[travis-img]: https://img.shields.io/travis/darkobits/log.svg?style=flat-square
[travis-url]: https://travis-ci.org/darkobits/log

[david-img]: https://img.shields.io/david/darkobits/log.svg?style=flat-square
[david-url]: https://david-dm.org/darkobits/log

[david-dev-img]: https://img.shields.io/david/dev/darkobits/log.svg?style=flat-square
[david-dev-url]: https://david-dm.org/darkobits/log?type=dev

[cc-img]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square
[cc-url]: https://github.com/conventional-changelog/standard-version

[xo-img]: https://img.shields.io/badge/code_style-XO-e271a5.svg?style=flat-square
[xo-url]: https://github.com/sindresorhus/xo
