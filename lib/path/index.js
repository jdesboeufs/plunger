const fs = require('fs')
const util = require('util')
const path = require('path')

const mime = require('mime-types')

const readdir = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)

function parseType(token) {
  const ext = path.extname(token.fileName).substring(1)

  token.fileType = {
    ext,
    mime: mime.lookup(ext)
  }
}

async function parseDirectory(token) {
  const paths = await readdir(token.location)

  token.type = 'directory'
  token.children = paths.map(p => ({
    inputType: 'path',
    location: path.join(token.location, p),
    filePath: token.temporary ? p : path.join(token.filePath, p),
    fileName: p
  }))
  token.parsed = true
}

async function parseFile(token) {
  token.type = 'file'

  parseType(token)

  token.parsed = true
}

async function parsePath(token) {
  const stats = await stat(token.location)

  if (stats.isDirectory()) {
    await parseDirectory(token)
  } else if (stats.isFile()) {
    await parseFile(token)
  }
}

module.exports = parsePath
