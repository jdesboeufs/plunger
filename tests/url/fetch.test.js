const path = require('path')
const url = require('url')
const test = require('ava')
const fetch = require('../../lib/url/fetch')

const {serveFile, serveEmpty, serveRedirect} = require('../__helpers__/server')

const options = {
  userAgent: 'plunger/test',
  timeout: {}
}

test('should attach a response object to the token', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
  const token = {url: location}

  await fetch(token, options)

  t.truthy(token.response)
})

test('should set the statusCode to the token', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
  const token = {url: location}

  await fetch(token, options)

  t.is(token.statusCode, 200)
})

test('should set the finalUrl to the token', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
  const token = {url: location}

  await fetch(token, options)

  t.is(token.finalUrl, location)
})

test('should process URL redirections and set them to the token', async t => {
  const final = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
  const first = await serveRedirect(final)
  const token = {url: first}

  await fetch(token, options)
  const resolvedFinal = url.resolve(first, final)

  t.is(token.url, first)
  t.deepEqual(token.redirectUrls, [resolvedFinal])
  t.is(token.finalUrl, resolvedFinal)
})

test('should the user agent passed in the options', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
  const token = {url: location}

  await fetch(token, options)

  t.is(token.response.req.getHeader('user-agent'), options.userAgent)
})

test('should set if-modified-since when passing a lastModified string', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
  const token = {url: location}
  const lastModified = 'Mon, 01 May 2017 22:00:00 GMT'

  await fetch(token, Object.assign({lastModified}, options))

  t.is(token.response.req.getHeader('if-modified-since'), lastModified)
})

test('should set if-modified-since when passing a lastModified date', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
  const token = {url: location}
  const lastModified = new Date(2017, 4, 2)

  await fetch(token, Object.assign({lastModified}, options))

  t.is(token.response.req.getHeader('if-modified-since'), lastModified.toUTCString())
})

test('should set if-none-match when passing an etag', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
  const token = {url: location}
  const etag = '"cool-etag"'

  await fetch(token, Object.assign({etag}, options))

  t.is(token.response.req.getHeader('if-none-match'), etag)
})

test('should request both etags when passing an etag with a -gzip prefix', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
  const token = {url: location}
  const etag = '"cool-etag-gzip"'

  await fetch(token, Object.assign({etag}, options))

  t.is(token.response.req.getHeader('if-none-match'), '"cool-etag-gzip","cool-etag"')
})

test('should error if request has no body', async t => {
  const location = await serveEmpty()
  const token = {url: location}

  return t.throws(fetch(token, options), 'There was no body in the response')
})

test('should set the unchanged property for HTTP 304', async t => {
  const location = await serveEmpty(304)
  const token = {url: location}

  await fetch(token, options)

  t.deepEqual(token, {
    analyzed: true,
    unchanged: true,
    statusCode: 304,
    url: location,
    finalUrl: location,
    redirectUrls: []
  })
})

test('should error for invalid http codes', async t => {
  const location = await serveEmpty(400)
  const token = {url: location}

  return t.throws(fetch(token, options), 'An invalid HTTP code was returned: 400')
})
