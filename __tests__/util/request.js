const http = require('http')
const path = require('path')
const url = require('url')
const request = require('../../lib/util/request')

const {serveFile, serveRedirect} = require('../__helpers__/server')

describe('util.request', () => {
  it('should fail if location is not provided', () => {
    return expect(request()).rejects.toThrow('location is required')
  })

  it('should fail if too many redirects happened', () => {
    return expect(
      request('whatever', null, 0, new Array(5))
    ).rejects.toThrow('Too many redirections')
  })

  it('should fail if the protocol is not http or https', () => {
    return expect(
      request('foo://whatever')
    ).rejects.toThrow('location must have a valid protocol: http or https')
  })

  it('should handle invalid http urls', () => {
    return expect(
      request('http://whatever-not-accessible-please')
    ).rejects.toThrow(
      'getaddrinfo ENOTFOUND whatever-not-accessible-please whatever-not-accessible-please:80'
    )
  })

  it('should handle invalid https urls', async () => {
    return expect(
      request('https://whatever-not-accessible-please')
    ).rejects.toThrow(
      'getaddrinfo ENOTFOUND whatever-not-accessible-please whatever-not-accessible-please:443'
    )
  })

  it('should handle invalid http urls with custom ports', async () => {
    return expect(
      request('http://whatever-not-accessible-please:4242')
    ).rejects.toThrow(
      'getaddrinfo ENOTFOUND whatever-not-accessible-please whatever-not-accessible-please:4242'
    )
  })

  it('should return a response object', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

    const res = await request(location)

    expect(res).toBeInstanceOf(http.IncomingMessage)
  })

  it('should set a finalUrl property to the response object', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

    const res = await request(location)

    expect(res.finalUrl).toBe(location)
  })

  it('should set an empty array of redirections when did not redirect', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

    const res = await request(location)

    expect(res.redirectUrls).toHaveLength(0)
  })

  it('should request 301 redirections', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
    const redirect = await serveRedirect(location, 301)

    const res = await request(redirect)
    const resolvedLocation = url.resolve(redirect, location)

    expect(res.finalUrl).toBe(resolvedLocation)
    expect(res.redirectUrls).toEqual([resolvedLocation])
  })

  it('should request 302 redirections', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
    const redirect = await serveRedirect(location, 302)

    const res = await request(redirect)
    const resolvedLocation = url.resolve(redirect, location)

    expect(res.finalUrl).toBe(resolvedLocation)
    expect(res.redirectUrls).toEqual([resolvedLocation])
  })

  it('should allow passing custom headers', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

    const res = await request(location, {
      'User-Agent': 'super-cool-UA'
    })

    expect(res.req.getHeader('User-Agent')).toBe('super-cool-UA')
  })

  it('should allow passing a connection timeout', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

    const res = await request(location, null, 4242)

    expect(res.req.timeout).toBe(4242)
  })
})
