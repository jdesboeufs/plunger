# plunger [![CircleCI](https://circleci.com/gh/inspireteam/plunger.svg?style=svg)](https://circleci.com/gh/inspireteam/plunger)

[![npm version](https://img.shields.io/npm/v/plunger.svg)](https://www.npmjs.com/package/plunger)
[![codecov](https://codecov.io/gh/inspireteam/plunger/branch/master/graph/badge.svg)](https://codecov.io/gh/inspireteam/plunger)
[![dependencies Status](https://david-dm.org/inspireteam/plunger/status.svg)](https://david-dm.org/inspireteam/plunger)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

> Powerful link analyzer

`plunger` analyzes an URL or a local path and recursively builds a tree of the files it contains or links to. It can ignore files that haven’t changed since the last check, or depending on a specific Etag. All of it is configurable.

The analyzed files are downloaded to temporary locations on your system. It’s up to you to do anything with them, and to clean those locations afterwards.

## Usage

`plunger` can be used in your project or as a CLI (with limited configuration support).

### Requirements

* [Node.js](https://nodejs.org) >= 8.0
* [unar](https://theunarchiver.com/command-line)


### Installation

You can add `plunger` to your project by running:

```shell
$ npm install --save plunger
```

Or if you’re using Yarn:

```shell
$ yarn add plunger
```

### CLI

You can install `plunger` globally, using:

```shell
$ npm install --global plunger
$ plunger --help
```

Or, with Yarn:

```shell
$ yarn global add plunger
$ plunger --help
```

## Analyzing

Two types of resources can be identified: files and containers. Containers either contain other resources or link to other resources.

There are two types of analyzers: `url` and `path`.
An URL will go through the `url` analyzers to determine whether the resources can be an `url` container, then files will be downloaded and go through the `path` analyzers, to identify `path` containers.

Supported container types:
- Directories (`path`)
- Archives (`path`)
- *Index of* pages (`url`)
- Atom feeds (`url`)

Everything that is not matched as a container will be a file. Containers will expose an array of children resources, which can be either containers, or files.

A tree is then built recursively, following that principle.

## API

`plunger` only exposes one function: `analyzeLocation(location, options)`

This function builds a complete tree of all the items found at `location`.

For example, analyzing `http://example.org/index.html` would yield something like the following:

```js
{ inputType: 'url',
  url: 'http://example.org/index.html',
  statusCode: 200,
  redirectUrls: [],
  finalUrl: 'http://example.org/index.html',
  etag: '"359670651+gzip"',
  fileName: 'index.html',
  fileTypes:
   [ { ext: 'html', mime: 'text/html', source: 'url:content-type' },
     { ext: 'html', mime: 'text/html', source: 'url:filename' },
     { ext: 'html', mime: 'text/html', source: 'path:filename' } ],
  temporary: '/var/folders/wb/4xx5dj9j0r12lym3mgxhj0l00000gn/T/plunger_nk443a',
  fileSize: 1270,
  digest: 'sha384-bo7Rewmo/VHAS0xEa1JGwfNQAKfP42gfnoF9DM3grWq+0TT4ygQ+4P4NJLNBFBI/',
  path: '/var/folders/wb/4xx5dj9j0r12lym3mgxhj0l00000gn/T/plunger_nk443a/index.html',
  type: 'file',
  analyzed: true }
```

- `location` is a string, it can be either a path on your filesystem, or an URL.
- `options` is an object of options:

| option          | default value | type    | description |
|-----------------|---------------|---------|----------|
| etag            | `null`        | String  | Will be set to the `If-None-Match` HTTP header |
| lastModified    | `null`        | String|Date | Date of `location`’s last modification date, will be set to the `If-Modified-Since` HTTP header |
| userAgent       | plunger/1.0   | String  | User agent, will be set to the `User-Agent` HTTP header |
| timeout         | `{connection: 2000, activity: 4000, download: 0}` | Object | See timeouts section |
| cache           | `null` | Object | See caching section |
| maxDownloadSize | 100 * 1024 * 1024 | Number | Max size, in bytes, before the download of a file is interrupted |
| digestAlgorithm | sha384        | String  | Algorithm which file digests are computed with |
| extractArchives | `true`        | Boolean | Disable to stop extracting archives |
| indexOfMatches  | `[/Directory of/, /Index of/, /Listing of/]` | RegExp[] | Array of regexp to match index of-type pages |
| logger          | defaultLogger based on `debug` | Object  | Define a logger with a `log(event, token)` method |

It returns a `Promise` to the root tree node.

#### Timeouts

There are 3 configurable timeouts:

- `connection`: timeout before an HTTP/HTTPS connection can be established, defaults to `2000ms`.
- `activity`: timeout between 2 data chunks received by the server, defaults to `4000ms`.
- `download`: timeout for the whole file to be downloaded, defaults to `0` (disabled).

All timeouts can be disabled by setting them to 0.

#### Caching

##### URL Cache

It is possible to pass a callback to retrieve informations about previous URL checks in order to allow unnecessary downloads. This is done using `cache.getUrlCache(token)` and `cache.setUrlCache(token)` options of `analyzeLocation()`.

`cache.getUrlCache` will return an object of options that will override the options passed to `analyzeLocation()`. It can be interesting to set a `lastModified` and an `etag` property.

The idea is to save information about an analyzed URL in `cache.setUrlCache` in a custom cache.

##### File Cache

You can also pass a callback to match a file’s digest against a database, in order to stop processing the file if it hasn’t change. For example, it would be wise to prevent extracting an archive and analyzing its content if the archive hasn’t changed.

This is done using the `cache.getFileCache(token)` option of `analyzeLocation()`.

`cache.getFileCache` will return a `Boolean` indicating whether the file is in cache. Return `true` to stop further analyzes.


##### Example

```js
async function getUrlCache(token) {
  const cache = await db.getByUrl(token.url)

  console.log(cache ? 'HIT' : 'MISS', token.url)
  return {
    etag: cache.etag,
    lastModified: cache.lastModified
  }
}
```

```js
async function setUrlCache(token) {
  const urls = [...token.redirectUrls, token.finalUrl]

  for (const url of urls) {
    await db.create({
      url,
      etag: token.etag,
      lastModified: token.lastModified
    })
    console.log('SAVE', url)
  }
}
```

```js
async function getFileCache(token) {
  const cache = await db.findFileFromToken(token) // Magic

  return cache.digest === token.digest
}
```

```js
const {analyzeLocation} = require('plunger')

const tree = await analyzeLocation('http://example.com', {
  cache: {
    getUrlCache,
    setUrlCache,
    getFileCache
  }
})
```


#### Example usage:

```js
const {analyzeLocation} = require('plunger')

const tree = await analyzeLocation('http://example.org/', {
  digestAlgorithm: 'md5' // No fear
})

console.log(tree.digest)
```

## License

MIT
