const fs = require('fs')
const util = require('util')

const parseDirectory = require('./parsers/directory')
const parseName = require('./parsers/name')
const parseType = require('./parsers/type')
const parseArchive = require('./parsers/archive')
const parseFile = require('./parsers/file')

const lstat = util.promisify(fs.lstat)

async function parsePath(token, options) {
  if (token.parsed) return false

  options.logger.log('path:analyze:start', token)

  token.stats = await lstat(token.path)

  try {
    if (token.stats.isDirectory()) {
      await parseDirectory(token, options)
    } else if (token.stats.isFile()) {
      parseName(token, options)
      parseType(token, options)

      await parseArchive(token, options)
      await parseFile(token, options)
    } else {
      throw new Error('Unsupported file type')
    }
  } catch (err) {
    throw err
  } finally {
    delete token.stats
  }

  options.logger.log('path:analyze:end', token)
}

module.exports = parsePath
