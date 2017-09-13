'use strict'

const parse = require('./parse')

async function analyze(location, options) {
  options = Object.assign({
    etag: null,
    lastCheckedAt: null,
    userAgent: 'plunger/1.0',
    fetchTimeout: 10000,
    inlineTypes: [
      'xml',
      'html',
      'txt',
      'json'
    ],
    digestAlgorithm: 'sha384'
  }, options)

  const token = {
    inputType: 'url',
    location
  }

  try {
    await parse(token, options)
  } catch (err) {
    Object.assign(token, {
      type: 'error',
      error: err.message
    })
  }

  return token
}

module.exports = analyze
