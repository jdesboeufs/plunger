'use strict'

const path = require('node:path')
const url = require('node:url')
const analyze = require('./analyze')
const defaultOptions = require('./options')

async function analyzeLocation(location, options) {
  options = {
    ...defaultOptions,
    ...options
  }

  const u = url.parse(location)

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
