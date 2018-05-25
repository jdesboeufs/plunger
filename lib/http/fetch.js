'use strict'

const {hasBody} = require('type-is')
const request = require('../util/request')

const gzipSuffix = '-gzip"'
function generateIfNoneMatch(etag) {
  const etags = [etag]

  // When Accepting gzip, some servers (apache) configuration send an
  // Etag suffixed with -gzip. Though it doesn’t seem to be handling
  // the -gzip Etag correctly. So we’re passing the original Etag along
  // as well.
  if (etag.endsWith(gzipSuffix)) {
    etags.push(etag.slice(0, -gzipSuffix.length) + '"')
  }

  return etags.join(',')
}

async function fetch(token, options) {
  const headers = {
    'User-Agent': options.userAgent
  }

  if (options.lastModified) {
    if (options.lastModified instanceof Date && isFinite(options.lastModified)) {
      headers['If-Modified-Since'] = options.lastModified.toUTCString()
    } else {
      headers['If-Modified-Since'] = options.lastModified
    }
  }

  if (options.etag) {
    headers['If-None-Match'] = generateIfNoneMatch(options.etag)
  }

  const response = await request(token.url, headers, options.timeout.connection)
  const {statusCode, finalUrl, redirectUrls} = response

  token.statusCode = statusCode
  token.redirectUrls = redirectUrls
  token.finalUrl = finalUrl

  if (response.headers.etag) {
    token.etag = response.headers.etag
  }

  const lastModified = response.headers['last-modified']
  if (lastModified) {
    token.lastModified = lastModified
  }

  const cacheControl = response.headers['cache-control']
  if (cacheControl) {
    token.cacheControl = cacheControl
  }

  switch (response.statusCode) {
    case 200:
      if (hasBody(response)) {
        token.response = response
        return
      }

      throw new Error('There was no body in the response')

    case 304:
      token.unchanged = true
      token.analyzed = true
      break

    default:
      throw new Error(`An invalid HTTP code was returned: ${statusCode}`)
  }

  response.destroy()
}

module.exports = fetch
