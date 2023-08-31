'use strict'

const bluebird = require('bluebird')
const analyzeHttp = require('./http')
const analyzePath = require('./path')

async function analyze(token, options) {
  try {
    options.logger.log('analyze:start', token)

    if (token.url) {
      await analyzeHttp(token, options)
    }

    // Whenever analyzeUrl is analyzing a file, it will end up downloading
    // the file in a temporary location and setting `path`.
    // When `path` is set, we pass through the path analyzer to potentially
    // augment the token.
    if (token.path) {
      await analyzePath(token, options)
    }
  } catch (error) {
    token.error = error.message
    token.analyzed = true
  }

  if (!token.analyzed) {
    throw new Error(`Token with inputType ${token.inputType} was not analyzed`)
  }

  options.logger.log('analyze:end', token)

  if (token.children) {
    await bluebird.map(token.children, token => analyze(token, options), {
      concurrency: options.concurrency
    })
  }
}

module.exports = analyze
