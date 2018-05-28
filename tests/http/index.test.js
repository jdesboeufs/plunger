const path = require('path')
const test = require('ava')
const analyzeUrl = require('../../lib/http')

const {serveFile} = require('../__helpers__/server')
const rm = require('../__helpers__/rm')

const options = {
  userAgent: 'plunger/test',
  digestAlgorithm: 'md5',
  indexOfMatches: [
    /Index of/
  ],
  logger: {
    log: () => {}
  },
  timeout: {}
}

test('should not update token if already analyzed', async t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = await analyzeUrl(token)

  t.false(ret)
  t.deepEqual(token, save)
})

test('should analyze an index-of completely', async t => {
  const url = await serveFile(path.resolve(__dirname, '../__fixtures__/index-of/basic.html'))

  const token = {url}

  await analyzeUrl(token, options)

  t.deepEqual(token, {
    analyzed: true,
    children: [
      {
        inputType: 'url',
        url: `${url}/file.txt`
      },
      {
        inputType: 'url',
        url: `${url}/file.zip`
      }
    ],
    etag: token.etag,
    lastModified: token.lastModified,
    cacheControl: token.cacheControl,
    fileTypes: [{
      ext: 'html',
      mime: 'text/html',
      source: 'http:content-type'
    }],
    finalUrl: url,
    redirectUrls: [],
    statusCode: 200,
    type: 'index-of',
    url
  })
})

test('should allow overriding fetch options with cache.getUrlCache', async t => {
  const url = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

  const token = {url}

  await analyzeUrl(token, Object.assign({}, options, {
    cache: {
      getUrlCache: token => {
        token.hacked = true
      }
    }
  }))

  t.true(token.hacked)

  return rm(token.temporary)
})

test('should call cache.settUrlCache to save url token data for caching purposes', async t => {
  const url = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

  const token = {url}

  await analyzeUrl(token, Object.assign({}, options, {
    cache: {
      setUrlCache: token => {
        token.hacked = true
      }
    }
  }))

  t.true(token.hacked)

  return rm(token.temporary)
})