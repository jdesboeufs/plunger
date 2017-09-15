
const fetch = require('./fetch')

const parseName = require('./parsers/name')
const parseType = require('./parsers/type')

const parseHtml = require('./parsers/html')
const parseArchive = require('./parsers/archive')

const parseBody = require('./parsers/body')

async function parseUrl(token, options) {
  try {
    await fetch(token, options)
  } catch (err) {
    if (token.response) {
      token.response.destroy()
    }
    throw err
  }

  if (token.response) {
    await parseName(token, options)
    await parseType(token, options)

    await parseHtml(token, options)
    await parseArchive(token, options)

    await parseBody(token, options)

    if (token.parsed) {
      token.response.destroy()
    }

    delete token.response
  }
}

module.exports = parseUrl
