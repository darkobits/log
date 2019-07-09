<a href="#top" id="top">
  <img src="https://user-images.githubusercontent.com/441546/41699021-76157614-74d6-11e8-9ad0-13708b41176e.png" style="max-width: 100%">
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/log"><img src="https://img.shields.io/npm/v/@darkobits/log.svg?style=flat-square"></a>
  <a href="https://travis-ci.org/darkobits/log"><img src="https://img.shields.io/travis/darkobits/log.svg?style=flat-square"></a>
  <a href="https://www.codacy.com/app/darkobits/log"><img src="https://img.shields.io/codacy/coverage/b64cfd79c4994acf8b31ff10b6d0ac87.svg?style=flat-square"></a>
  <a href="https://david-dm.org/darkobits/log"><img src="https://img.shields.io/david/darkobits/log.svg?style=flat-square"></a>
  <a href="https://github.com/conventional-changelog/standard-version"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-027dc6.svg?style=flat-square"></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-e271a5.svg?style=flat-square"></a>
</p>

A logger suitable for CLIs. Inspired by [`npmlog`](https://github.com/npm/npmlog).

## Install

```bash
$ npm i @darkobits/log
```

## Use

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

For a complete description of the log object, see [`etc/types.ts`](/src/etc/types.ts#L79-L162).

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>
