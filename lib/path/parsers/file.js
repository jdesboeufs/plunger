'use strict'

const fs = require('fs')
const hasha = require('hasha')

async function parseFile(token, options) {
  if (token.parsed) return false

  token.type = 'file'

  if (!token.digest) {
    const digest = await hasha.fromStream(fs.createReadStream(token.path), {
      algorithm: options.digestAlgorithm
    })
    token.digest = `${options.digestAlgorithm}-${digest}`
  }

  if (!token.fileSize && token.stats) {
    token.fileSize = token.stats.size
  }

  token.parsed = true
}

module.exports = parseFile
