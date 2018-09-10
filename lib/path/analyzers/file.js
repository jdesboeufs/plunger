'use strict'

function analyzeFile(token) {
  if (token.analyzed) {
    return false
  }

  token.type = 'file'
  token.analyzed = true
}

module.exports = analyzeFile
