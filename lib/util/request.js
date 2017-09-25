'use strict'

const http = require('http')
const https = require('https')
const url = require('url')
const {createGunzip} = require('zlib')
const {pipeline} = require('mississippi')
const {hasBody} = require('type-is')

const adapters = {
  http: {
    get: http.get,
    agent: new http.Agent({
      maxSockets: 4
    })
  },
  https: {
    get: https.get,
    agent: new https.Agent({
      maxSocket: 4
    })
  }
}

async function request(location, headers, timeout = 0, _redirections = []) {
  if (_redirections.length >= 5) {
    const error = new Error('Too many redirections')
    error.redirections = _redirections
    throw error
  }

  if (!location) throw (new Error('location is required'))

  const parsed = url.parse(location)

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('location must have a valid protocol: http or https')
  }

  const adapter = adapters[parsed.protocol === 'https:' ? 'https' : 'http']

  const requestOptions = {
    host: parsed.host,
    path: parsed.path,
    timeout,
    agent: adapter.agent,
    headers: {
      ...headers,
      'Accept-Encoding': 'gzip'
    }
  }

  if (parsed.port) {
    requestOptions.port = parsed.port
  }

  return new Promise((resolve, reject) => {
    adapter
      .get(requestOptions)
      .on('error', reject)
      .once('response', response => {
        if ([301, 302].includes(response.statusCode)) {
          const redirectLocation = response.headers.location
          _redirections.push(redirectLocation)
          resolve(request(redirectLocation, headers, timeout, _redirections))
        } else {
          response.finalURL = location
          response.redirectURLs = _redirections
          if (hasBody(response)) {
            response.pause()
            response.body = isGzipped(response) ?
              pipeline(response, createGunzip()) :
              response
          }
          resolve(response)
        }
      })
      .end()
  })
}

function isGzipped(response) {
  if (!response.headers['content-encoding']) return false
  return response.headers['content-encoding'].includes('gzip')
}

module.exports = request
