'use strict'

const fs = require('fs')
const hasha = require('hasha')

async function analyzeFile(token, options) {
  if (token.analyzed) {
    return false
  }

  token.type = 'file'

  if (!token.fileSize && token.stats) {
    token.fileSize = token.stats.size
  }

  if (!token.digest) {
    const digest = await hasha.fromStream(fs.createReadStream(token.path), {
      algorithm: options.digestAlgorithm,
      encoding: 'base64'
    })
    token.digest = `${options.digestAlgorithm}-${digest}`

    if (options.cache && options.cache.getFileCache && await options.cache.getFileCache(token, options)) {
      token.type = 'unchanged'
      token.analyzed = true
    }
  }

  token.analyzed = true
}

module.exports = analyzeFile
