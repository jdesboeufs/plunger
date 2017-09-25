# plunger

[![npm version](https://img.shields.io/npm/v/plunger.svg)](https://www.npmjs.com/package/plunger)
[![Build Status](https://travis-ci.org/inspireteam/plunger.svg?branch=master)](https://travis-ci.org/inspireteam/plunger)
[![codecov](https://codecov.io/gh/inspireteam/plunger/branch/master/graph/badge.svg)](https://codecov.io/gh/inspireteam/plunger)
[![dependencies Status](https://david-dm.org/inspireteam/plunger/status.svg)](https://david-dm.org/inspireteam/plunger)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

> Powerful link analyzer

`plunger` analyzes an URL or a local path and recursively builds a tree of the files it contains or links to. It then extracts relevant files and file groups from that tree. It can associate files that work together, filter specific types, ignore files that haven’t changed since the last check, or depending on a specific Etag. And all of it is configurable.

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

`plunger` only exposes two functions:

### `analyzeLocation(location, options)`

This function builds a complete tree of all the items found at `location`.

For example, analyzing `http://example.org/index.html` would yield something like the following:

```js
{ inputType: 'url',
  url: 'http://example.org/index.html',
  statusCode: 200,
  redirectURLs: [],
  finalURL: 'http://example.org/index.html',
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
| lastCheckedAt   | `null`        | Date    | Date of `location`’s previous check, will be set to the `If-Modified-Since` HTTP header |
| userAgent       | plunger/1.0   | String  | User agent, will be set to the `User-Agent` HTTP header |
| timeout         | `{connection: 2000, activity: 4000, download: 0}` | Object | See timeouts section |
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


#### Example usage:

```js
const {analyzeLocation} = require('plunger')

const tree = await analyzeLocation('http://example.org/', {
  digestAlgorithm: 'md5' // No fear
})

console.log(tree.digest)
```


### `extractFiles(node, options)`

This function flattens the tree returned by `analyzeLocation` to identify files and file groups. It also returns useful arrays of `errors`, `warnings`, `cacheable` resources and `temporary` locations that can be cleaned up later.

For the same `http://example.org/index.html` resources, it would return the following:

```js
{ files:
   [ { url: 'http://example.org/index.html',
       statusCode: 200,
       redirectURLs: [],
       finalURL: 'http://example.org/index.html',
       etag: '"359670651+gzip"',
       fileName: 'index.html',
       fileTypes:
        [ { ext: 'html', mime: 'text/html', source: 'url:content-type' },
          { ext: 'html', mime: 'text/html', source: 'url:filename' },
          { ext: 'html', mime: 'text/html', source: 'path:filename' } ],
       fileSize: 1270,
       digest: 'sha384-bo7Rewmo/VHAS0xEa1JGwfNQAKfP42gfnoF9DM3grWq+0TT4ygQ+4P4NJLNBFBI/',
       path: '/var/folders/wb/4xx5dj9j0r12lym3mgxhj0l00000gn/T/plunger_ITEo7m/index.html',
       type: 'file' } ],
  unchanged: [],
  cacheable:
   [ { url: 'http://example.org/index.html',
       statusCode: 200,
       redirectURLs: [],
       finalURL: 'http://example.org/index.html',
       etag: '"359670651+gzip"',
       fileName: 'index.html',
       fileTypes:
        [ { ext: 'html', mime: 'text/html', source: 'url:content-type' },
          { ext: 'html', mime: 'text/html', source: 'url:filename' },
          { ext: 'html', mime: 'text/html', source: 'path:filename' } ],
       fileSize: 1270,
       digest: 'sha384-bo7Rewmo/VHAS0xEa1JGwfNQAKfP42gfnoF9DM3grWq+0TT4ygQ+4P4NJLNBFBI/',
       path: '/var/folders/wb/4xx5dj9j0r12lym3mgxhj0l00000gn/T/plunger_ITEo7m/index.html',
       type: 'file' } ],
  errors: [],
  warnings: [],
  temporary: [ '/var/folders/wb/4xx5dj9j0r12lym3mgxhj0l00000gn/T/plunger_ITEo7m' ] }
```

- `node` is an element returned by `analyzeLocation`
- `options` is an object of `options`:
  - `types` is an array of known types in the following form:
    ```js
    [
      { extensions: ['shp'],
        type: 'shapefile',
        related: ['shx', 'dbf', 'prj'] },
      { extensions: ['pdf', 'doc'],
        type: 'document' }
    ]
    ```
  - `keepUnknownTypes` (defaults to `true`) controls whether unspecified types should be left in the output.

The `related` extensions of a type will be linked to the matching extension type as dependants and the `type` will be updated.

It returns an Object with the following structure:
```js
{
  files: [],     // List of matched files
  unchanged: [], // HTTP 304
  cacheable: [], // List of resources that contain an Etag
  errors: [],    // List of resources that errored
  warnings: [],  // List of resources that yielded a warning but still went through all of it
  temporary: []  // List of strings of temporary directories that need cleanup
}
```

#### Example usage:

```js
const {extractFiles} = require('plunger')

const output = extractFiles(tree)

console.log(`I found ${output.files.length} files`)
```

## License

MIT
