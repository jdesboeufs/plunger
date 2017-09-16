const fs = require('fs')
const util = require('util')

const parseDirectory = require('./parsers/directory')
const parseName = require('./parsers/name')
const parseType = require('./parsers/type')
const parseArchive = require('./parsers/archive')
const parseFile = require('./parsers/file')

const stat = util.promisify(fs.stat)

async function parsePath(token, options) {
  const stats = await stat(token.location)

  if (stats.isDirectory()) {
    await parseDirectory(token, options)
  } else if (stats.isFile()) {
    parseName(token, options)
    parseType(token, options)

    await parseArchive(token, options)
    await parseFile(token, options)
  }
}

module.exports = parsePath
