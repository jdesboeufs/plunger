'use strict'

const fetch = require('./fetch')

const analyzeName = require('./analyzers/name')
const analyzeTypes = require('./analyzers/types')

const analyzeIndexOf = require('./analyzers/index-of')
const analyzeAtom = require('./analyzers/atom')

const analyzeFile = require('./analyzers/file')

async function analyzeUrl(token, options) {
  if (token.analyzed) {
    return false
  }

  let override
  if (options.cache && options.cache.getUrlCache) {
    override = await options.cache.getUrlCache(token, options)
  }

  options.logger.log('url:analyze:start', token)

  try {
    await fetch(token, {
      ...options,
      ...override
    })

    if (token.response) {
      await analyzeName(token, options)
      await analyzeTypes(token, options)

      await analyzeIndexOf(token, options)
      await analyzeAtom(token, options)

      await analyzeFile(token, options)

      if (options.cache && options.cache.setUrlCache) {
        await options.cache.setUrlCache(token, options)
      }
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
