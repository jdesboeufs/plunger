'use strict'

const parseUrl = require('./url')
const parsePath = require('./path')

async function parse(token, options) {
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

  if (!token.parsed) {
    console.warn(`Token with inputType '${token.inputType}' was not parsed`)
  }

  if (token.children) {
    await Promise.all(token.children.map(token => parse(token, options)))
  }
}

module.exports = parse
