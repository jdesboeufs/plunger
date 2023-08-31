'use strict'

const http = require('node:http')
const https = require('node:https')
const {hasBody} = require('type-is')
const got = require('got')

const agents = {
  http: new http.Agent({
    maxSockets: 4
  }),
  https: new https.Agent({
    maxSocket: 4
  })
}

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

function request(url, headers, timeout) {
  return new Promise((resolve, reject) => {
    const redirects = []

    got
      .stream(url, {
        agent: agents,
        headers,
        decompress: true,
        followRedirect: true,
        timeout: {
          lookup: timeout.connection,
          connect: timeout.connection,
          secureConnect: timeout.connection,
          socket: timeout.connection
        }
      })
      .on('redirect', (res, options) => {
        redirects.push(options.href)
      })
      .once('response', res => {
        res.pause()

        resolve({
          response: res,
          redirectUrls: redirects,
          finalUrl: res.url
        })
      })
      .on('error', reject)
      .resume()
  })
}

async function fetch(token, options) {
  const headers = {
    'Accept-Encoding': 'gzip',
    'User-Agent': options.userAgent
  }

  if (options.lastModified) {
    headers['If-Modified-Since'] = options.lastModified instanceof Date && isFinite(options.lastModified) ? options.lastModified.toUTCString() : options.lastModified
  }

  if (options.etag) {
    headers['If-None-Match'] = generateIfNoneMatch(options.etag)
  }

  const {response, redirectUrls, finalUrl} = await request(token.url, headers, options.timeout)

  token.statusCode = response.statusCode
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
    case 304: {
      token.unchanged = true
      token.analyzed = true
      break
    }

    default: {
      if (hasBody(response)) {
        token.response = response
        return
      }

      throw new Error('There was no body in the response')
    }
  }
}

module.exports = fetch
