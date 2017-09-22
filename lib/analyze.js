'use strict'

const analyzeUrl = require('./url')
const analyzePath = require('./path')

async function analyze(token, options) {
  try {
    options.logger.log('analyze:start', token)

    if (token.url) {
      await analyzeUrl(token, options)
    }

    // Whenever analyzeUrl is analyzing a file, it will end up downloading
    // the file in a temporary location and setting `path`.
    // When `path` is set, we pass through the path analyzer to potentially
    // augment the token.
    if (token.path) {
      await analyzePath(token, options)
    }
  } catch (err) {
    token.error = err.message
    token.analyzed = true
  }

  if (!token.analyzed) {
    throw new Error(`Token with location ${token.location} was not analyzed`)
  }

  options.logger.log('analyze:end', token)

  if (token.children) {
    await Promise.all(token.children.map(token => analyze(token, options)))
  }
}

module.exports = analyze
