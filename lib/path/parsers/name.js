'use strict'

const path = require('path')

function parseName(token) {
  if (token.parsed) return false

  token.fileName = path.basename(token.path)
}

module.exports = parseName
