'use strict'

const request = require('../util/request')

async function fetch(token, options) {
  const headers = {
    'User-Agent': options.userAgent
  }

  if (options.lastCheckedAt instanceof Date && isFinite(options.lastCheckedAt)) {
    headers['If-Modified-Since'] = options.lastCheckedAt.toUTCString()
  }

  if (options.etag) {
    headers['If-None-Match'] = options.etag
  }

  const response = await request(token.url, headers)
  const {statusCode, finalURL, redirectURLs} = response

  token.statusCode = statusCode
  token.redirectURLs = redirectURLs
  token.finalURL = finalURL

  if (response.headers.etag) {
    token.etag = response.headers.etag
  }

  switch (response.statusCode) {
    case 200:
      if (response.body) {
        token.response = response
        break
      }

      throw new Error('There was no body in the response')

    case 304:
      token.type = 'unchanged'
      token.analyzed = true
      break

    default:
      throw new Error(`An invalid HTTP code was returned: ${statusCode}`)
  }
}

module.exports = fetch
