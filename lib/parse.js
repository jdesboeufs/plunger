'use strict'

const parseUrl = require('./url')
const parsePath = require('./path')

async function parse(token, options) {
  try {
    options.logger.log('analyze:start', token)

    switch (token.inputType) {
      case 'url':
        await parseUrl(token, options)
        break

      case 'path':
        await parsePath(token, options)
        break

      default:
        throw new Error(`Unknown token inputType ${token.inputType}`)
    }
  } catch (err) {
    token.type = 'error'
    token.error = err.message
    token.parsed = true
  }

  if (!token.parsed) {
    throw new Error(`Token with location ${token.location} was not analyzed`)
  }

  options.logger.log('analyze:end', token)

  if (token.children) {
    await Promise.all(token.children.map(token => parse(token, options)))
  }
}

module.exports = parse
