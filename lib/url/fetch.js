const {omit} = require('lodash')

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

  const response = await request(token.location, headers)
  const {statusCode, finalURL, redirectURLs} = response

  Object.assign(token, {
    // headers: omit(response.headers, 'set-cookie', 'connection'),
    statusCode,
    redirectURLs,
    finalURL
  })

  switch (response.statusCode) {
    case 200:
      if (response.body) {
        return Object.assign(token, {
          status: 'success',
          response
        })
      }

      response.destroy()
      return Object.assign(token, {
        status: 'error',
        error: 'There was no body in the response'
      })

    case 304:
      response.destroy()
      return Object.assign(token, {
        status: 'not-modified'
      })

    default:
      response.destroy()
      return Object.assign(token, {
        status: 'error',
        error: `An invalid HTTP code was returned: ${statusCode}`
      })
  }
}

module.exports = fetch
