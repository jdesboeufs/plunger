'use strict'

async function analyzeFile(token) {
  if (token.analyzed) {
    return false
  }

  token.type = 'file'

  if (!token.fileSize && token.stats) {
    token.fileSize = token.stats.size
  }

  token.analyzed = true
}

module.exports = analyzeFile
