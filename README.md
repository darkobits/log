<a href="#top" id="top">
  <img src="https://user-images.githubusercontent.com/441546/41699021-76157614-74d6-11e8-9ad0-13708b41176e.png" style="max-width: 100%">
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/log"><img src="https://img.shields.io/npm/v/@darkobits/log.svg?style=flat-square"></a>
  <a href="https://github.com/darkobits/log/actions"><img src="https://img.shields.io/endpoint?url=https://aws.frontlawn.net/ga-shields/darkobits/log&style=flat-square"></a>
  <a href="https://www.codacy.com/app/darkobits/log"><img src="https://img.shields.io/codacy/coverage/b64cfd79c4994acf8b31ff10b6d0ac87.svg?style=flat-square"></a>
  <a href="https://david-dm.org/darkobits/log"><img src="https://img.shields.io/david/darkobits/log.svg?style=flat-square"></a>
  <a href="https://github.com/conventional-changelog/standard-version"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-FB5E85.svg?style=flat-square"></a>
</p>

A wrapper around the wonderful [`npmlog`](https://github.com/npm/npmlog) that allows for the creation of unique instances.

## Install

```bash
$ npm i @darkobits/log
```

## Use

This package's default export is a factory function with the following signature:


```ts
LogFactory(heading: string, level?: string);
```

If `level` is omitted, the log level will be set to `process.env.LOG_LEVEL` if set. Otherwise, it will use the `npmlog` default level, `info`.

**Example:**

> `foo.js`

```ts
import LogFactory from '@darkobits/log';

// For convenience, you can set the heading and/or level via the factory function.
const log = LogFactory('foo', 'silly');

export default function init() {
  log.silly('init', 'Hello, there!');
}
```

Using `npmlog` alone, `bar.js` below would wind up importing the same object imported by `foo.js`, with its `heading` and `level` already set. Even worse, if `bar.js` changes them and then `foo.js` logs something, the resulting output will be completely [hosed](https://www.youtube.com/embed/hdBBq56T_Gc?autoplay=1&rel=0&modestbranding=1).


> `bar.js`

```ts
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

```ts
import init from './foo';
import barnacles from './bar';

barnacles();
init();
```

And get the following output:

![bar](https://user-images.githubusercontent.com/441546/32649476-f9b915ca-c5ae-11e7-8bc8-9d7e2542640e.jpg)
![foo](https://user-images.githubusercontent.com/441546/32649473-f5303614-c5ae-11e7-871f-b7c8321ffd7c.jpg)

### Now With 50% More Chalk!

This package comes with [`chalk`](https://github.com/chalk/chalk) included, available at `log.chalk`:

```ts
log.info('doStuff', `We did the ${log.chalk.green.bold('stuff')}, huzzah!`);
```

## Why?

`npmlog` is great, but it was designed to be used by one package at a time. When there are multiple packages that depend on `npmlog` in the same execution context, things get wonky rather quickly. This package guarantees that each `import` gets its own instance with its own state that it can customize as it sees fit.

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>
