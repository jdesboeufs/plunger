'use strict'

const parseUrl = require('./url')
const parsePath = require('./path')

async function parse(token, options) {
  try {
    switch (token.inputType) {
      case 'url':
        await parseUrl(token, options)
        break

      case 'path':
        await parsePath(token, options)
        break

      default:
        Object.assign(token, {
          status: 'error',
          error: `Unknown token inputType ${token.inputType}`
        })
    }
  } catch (err) {
    token.type = 'error'
    token.error = err.message
    token.parsed = true
  }

  if (!token.parsed) {
    console.warn(`Token with inputType '${token.inputType}' was not parsed`)
  }

  if (token.children) {
    await Promise.all(token.children.map(token => parse(token, options)))
  }
}

module.exports = parse
