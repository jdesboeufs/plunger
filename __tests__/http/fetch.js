const path = require('path')
const url = require('url')
const fetch = require('../../lib/http/fetch')

const {serveFile, serveEmpty, serveRedirect} = require('../__helpers__/server')

const options = {
  userAgent: 'plunger/test',
  timeout: {}
}

describe('http.fetch', () => {
  it('should attach a response object to the token', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
    const token = {url: location}

    await fetch(token, options)

    expect(token.response).toBeTruthy()
  })

  it('should set the statusCode to the token', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
    const token = {url: location}

    await fetch(token, options)

    expect(token.statusCode).toBe(200)
  })

  it('should set the finalUrl to the token', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
    const token = {url: location}

    await fetch(token, options)

    expect(token.finalUrl).toBe(location + '/')
  })

  it('should process URL redirections and set them to the token', async () => {
    const final = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
    const first = await serveRedirect(final)
    const token = {url: first}

    await fetch(token, options)
    const resolvedFinal = url.resolve(first, final) // eslint-disable-line node/no-deprecated-api

    expect(token.url).toBe(first)
    expect(token.finalUrl).toBe(resolvedFinal)
    expect(token.redirectUrls).toEqual([resolvedFinal])
  })

  it('should the user agent passed in the options', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
    const token = {url: location}

    await fetch(token, options)

    expect(token.response.req.getHeader('user-agent')).toBe(options.userAgent)
  })

  it('should set if-modified-since when passing a lastModified string', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
    const token = {url: location}
    const lastModified = 'Mon, 01 May 2017 22:00:00 GMT'

    await fetch(token, {lastModified, ...options})

    expect(token.response.req.getHeader('if-modified-since')).toBe(lastModified)
  })

  it('should set if-modified-since when passing a lastModified date', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
    const token = {url: location}
    const lastModified = new Date(2017, 4, 2)

    await fetch(token, {lastModified, ...options})

    expect(token.response.req.getHeader('if-modified-since')).toBe(lastModified.toUTCString())
  })

  it('should set if-none-match when passing an etag', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
    const token = {url: location}
    const etag = '"cool-etag"'

    await fetch(token, {etag, ...options})

    expect(token.response.req.getHeader('if-none-match')).toBe(etag)
  })

  it('should request both etags when passing an etag with a -gzip prefix', async () => {
    const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))
    const token = {url: location}
    const etag = '"cool-etag-gzip"'

    await fetch(token, {etag, ...options})

    expect(token.response.req.getHeader('if-none-match')).toBe('"cool-etag-gzip","cool-etag"')
  })

  it('should error if request has no body', async () => {
    const location = await serveEmpty()
    const token = {url: location}

    return expect(fetch(token, options)).rejects.toThrow('There was no body in the response')
  })

  it('should set the unchanged property for HTTP 304', async () => {
    const location = await serveEmpty(304)
    const token = {url: location}

    await fetch(token, options)

    expect(token).toEqual({
      analyzed: true,
      unchanged: true,
      statusCode: 304,
      url: location,
      finalUrl: location + '/',
      redirectUrls: []
    })
  })

  it('should error for invalid http codes', async () => {
    const location = await serveEmpty(400)
    const token = {url: location}

    return expect(fetch(token, options)).rejects.toThrow('Response code 400 (Bad Request)')
  })
})
