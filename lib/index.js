'use strict'

const path = require('path')
const url = require('url')

const analyze = require('./analyze')
const defaultOptions = require('./options')

async function analyzeLocation(location, options) {
  options = {
    ...defaultOptions,
    ...options
  }

  const u = url.parse(location) // eslint-disable-line node/no-deprecated-api

  const token = u.protocol ? {
    inputType: 'http',
    url: location
  } : {
    inputType: 'path',
    path: path.resolve(location)
  }

  await analyze(token, options)

  return token
}

module.exports = {analyzeLocation}
