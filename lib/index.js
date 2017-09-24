'use strict'

const path = require('path')
const url = require('url')

const analyze = require('./analyze')
const flatten = require('./flatten')
const defaultOptions = require('./options')

async function analyzeLocation(location, options) {
  options = {
    ...defaultOptions.analyze,
    ...options
  }

  const u = url.parse(location)

  const token = u.protocol ? {
    inputType: 'url',
    url: location
  } : {
    inputType: 'path',
    path: path.resolve(location)
  }

  await analyze(token, options)

  return token
}

function extractFiles(token, options) {
  options = {
    ...defaultOptions.extract,
    ...options
  }

  return flatten(token, options)
}

module.exports = {analyzeLocation, extractFiles}
