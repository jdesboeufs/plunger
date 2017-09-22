'use strict'

const fs = require('fs')
const util = require('util')
const path = require('path')

const readdir = util.promisify(fs.readdir)

async function parseDirectory(token) {
  if (token.parsed) return false

  const paths = await readdir(token.path)

  token.type = 'directory'
  token.children = paths.map(p => ({
    inputType: 'path',
    path: path.join(token.path, p),
    filePath: path.join(token.filePath || '', p)
  }))
  token.parsed = true
}

module.exports = parseDirectory
