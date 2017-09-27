'use strict'

const fetch = require('./fetch')

const analyzeName = require('./analyzers/name')
const analyzeTypes = require('./analyzers/types')

const analyzeHtml = require('./analyzers/html')
const analyzeAtom = require('./analyzers/atom')

const analyzeFile = require('./analyzers/file')

async function analyzeUrl(token, options) {
  if (token.analyzed) {
    return false
  }

  options.logger.log('url:analyze:start', token)

  try {
    await fetch(token, options)

    if (token.response) {
      await analyzeName(token, options)
      await analyzeTypes(token, options)

      await analyzeHtml(token, options)
      await analyzeAtom(token, options)

      await analyzeFile(token, options)
    }
  } catch (err) {
    throw err
  } finally {
    delete token.response
    delete token.buffer
  }

  options.logger.log('url:analyze:end', token)
}

module.exports = analyzeUrl
