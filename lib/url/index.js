
const fetch = require('./fetch')

const parseName = require('./parsers/name')
const parseTypes = require('./parsers/types')

const parseHtml = require('./parsers/html')
const parseAtom = require('./parsers/atom')
const parseArchive = require('./parsers/archive')

const parseBody = require('./parsers/body')

async function parseUrl(token, options) {
  options.logger.log('url:analyze:start', token)

  try {
    await fetch(token, options)

    if (token.response) {
      await parseName(token, options)
      await parseTypes(token, options)

      await parseHtml(token, options)
      await parseAtom(token, options)
      await parseArchive(token, options)

      await parseBody(token, options)
    }
  } catch (err) {
    throw err
  } finally {
    if (token.response) {
      token.response.destroy()

      delete token.response
    }
  }

  options.logger.log('url:analyze:end', token)
}

module.exports = parseUrl
