'use strict'

const fs = require('fs')
const util = require('util')
const path = require('path')

const readdir = util.promisify(fs.readdir)

async function analyzeDirectory(token) {
  if (token.analyzed) {
    return false
  }

  const paths = await readdir(token.path)

  token.type = 'directory'
  token.children = paths.map(p => ({
    inputType: 'path',
    path: path.join(token.path, p),
    filePath: path.join(token.filePath || '', p),
    fromUrl: token.fromUrl
  }))
  token.analyzed = true
}

module.exports = analyzeDirectory
