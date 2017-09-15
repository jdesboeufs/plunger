const fs = require('fs')
const util = require('util')

const parseDirectory = require('./parsers/directory')
const parseName = require('./parsers/name')
const parseType = require('./parsers/type')
const parseArchive = require('./parsers/archive')
const parseFile = require('./parsers/file')

const stat = util.promisify(fs.stat)

async function parsePath(token) {
  const stats = await stat(token.location)

  if (stats.isDirectory()) {
    await parseDirectory(token)
  } else if (stats.isFile()) {
    parseName(token)
    parseType(token)

    await parseArchive(token)
    await parseFile(token)
  }
}

module.exports = parsePath
