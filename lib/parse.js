'use strict'

const parseUrl = require('./url')
const parsePath = require('./path')

async function parse(token, options) {
  try {
    options.logger.log('analyze:start', token)

    if (token.url) {
      await parseUrl(token, options)
    }

    if (token.path) {
      await parsePath(token, options)
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
