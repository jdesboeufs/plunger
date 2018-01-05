'use strict'

const http = require('http')
const https = require('https')
const url = require('url')
const decompress = require('decompress-response')

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
  if (!location) {
    throw (new Error('location is required'))
  }

  if (_redirections.length >= 5) {
    const error = new Error('Too many redirections')
    error.redirections = _redirections
    throw error
  }

  const parsed = url.parse(location)

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('location must have a valid protocol: http or https')
  }

  const adapter = adapters[parsed.protocol === 'https:' ? 'https' : 'http']

  const requestOptions = {
    host: parsed.hostname,
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
          const redirectLocation = url.resolve(location, response.headers.location)
          _redirections.push(redirectLocation)

          response.destroy()
          resolve(request(redirectLocation, headers, timeout, _redirections))
        } else {
          const res = decompress(response)
          res.pause()

          res.finalUrl = location
          res.redirectUrls = _redirections

          resolve(res)
        }
      })
      .end()
  })
}

module.exports = request
