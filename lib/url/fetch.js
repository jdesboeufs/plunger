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

  if (options.lastCheckedAt instanceof Date && isFinite(options.lastCheckedAt)) {
    headers['If-Modified-Since'] = options.lastCheckedAt.toUTCString()
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

  switch (response.statusCode) {
    case 200:
      if (hasBody(response)) {
        token.response = response
        return
      }

      throw new Error('There was no body in the response')

    case 304:
      token.type = 'unchanged'
      token.analyzed = true
      break

    default:
      throw new Error(`An invalid HTTP code was returned: ${statusCode}`)
  }

  response.destroy()
}

module.exports = fetch
