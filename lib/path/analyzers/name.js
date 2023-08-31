'use strict'

const path = require('node:path')

function analyzeName(token) {
  if (token.analyzed) {
    return false
  }

  token.fileName = path.basename(token.path)
}

module.exports = analyzeName
