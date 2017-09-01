'use strict'

const http = require('http')
const https = require('https')
const {createGunzip} = require('zlib')
const {parse} = require('url')
const {pipeline} = require('mississippi')
const {hasBody} = require('type-is')

function request(location, headers, _redirections = []) {
  return new Promise((resolve, reject) => {
    if (_redirections.length >= 5) {
      const error = new Error('Too many redirections')
      error.redirections = _redirections
      reject(error)
    }
    if (!location) reject(new Error('location is required'))
    const {protocol, host, port, path} = parse(location)
    if (!['http:', 'https:'].includes(protocol)) {
      throw reject(new Error('location must have a valid protocol: http or https'))
    }

    const fn = protocol === 'https:' ? https.request : http.request

    const requestOptions = {
      method: 'GET',
      host,
      path: encodeURI(path),
      headers: Object.assign({}, headers, {
        'Accept-Encoding': 'gzip',
        'User-Agent': 'plunger/1.0'
      })
    }
    if (port) requestOptions.port = port

    fn(requestOptions)
      .on('error', reject)
      .once('response', response => {
        if ([301, 302].includes(response.statusCode)) {
          const redirectLocation = response.headers.location
          _redirections.push(redirectLocation)
          resolve(request(redirectLocation, headers, _redirections))
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
