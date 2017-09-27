const http = require('http')
const path = require('path')
const test = require('ava')
const request = require('../../lib/util/request')

const {serveFile, serveRedirect} = require('../__helpers__/server')

test('should fail if location is not provided', t => {
  return t.throws(request(), 'location is required')
})

test('should fail if too many redirects happened', t => {
  return t.throws(request('whatever', null, 0, Array(5)), 'Too many redirections')
})

test('should fail if the protocol is not http or https', t => {
  return t.throws(request('foo://whatever'), 'location must have a valid protocol: http or https')
})

test('should handle invalid http urls', async t => {
  const err = await t.throws(request('http://whatever-not-accessible-please'), /getaddrinfo ENOTFOUND/)

  t.is(err.code, 'ENOTFOUND')
  t.is(err.port, 80)
})

test('should handle invalid https urls', async t => {
  const err = await t.throws(request('https://whatever-not-accessible-please'), /getaddrinfo ENOTFOUND/)

  t.is(err.code, 'ENOTFOUND')
  t.is(err.port, 443)
})

test('should handle invalid http urls with custom ports', async t => {
  const err = await t.throws(request('http://whatever-not-accessible-please:4242'), /getaddrinfo ENOTFOUND/)

  t.is(err.code, 'ENOTFOUND')
  t.is(err.port, '4242')
})

test('should return a response object', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

  const res = await request(location)

  t.true(res instanceof http.IncomingMessage)
})

test('should set a finalUrl property to the response object', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

  const res = await request(location)

  t.is(res.finalUrl, location)
})

test('should set an empty array of redirections when did not redirect', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

  const res = await request(location)

  t.deepEqual(res.redirectUrls, [])
})

test('should request 301 redirections', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
  const redirect = await serveRedirect(location, 301)

  const res = await request(redirect)

  t.is(res.finalUrl, location)
  t.deepEqual(res.redirectUrls, [location])
})

test('should request 302 redirections', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
  const redirect = await serveRedirect(location, 302)

  const res = await request(redirect)

  t.is(res.finalUrl, location)
  t.deepEqual(res.redirectUrls, [location])
})

test('should allow passing custom headers', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

  const res = await request(location, {
    'User-Agent': 'super-cool-UA'
  })

  t.is(res.req.getHeader('User-Agent'), 'super-cool-UA')
})

test('should allow passing a connection timeout', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

  const res = await request(location, null, 4242)

  t.is(res.req.timeout, 4242)
})
