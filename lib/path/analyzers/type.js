'use strict'

const path = require('path')
const mime = require('mime-types')

function analyzeType(token) {
  if (token.analyzed) return false

  const ext = path.extname(token.fileName).substring(1)

  token.fileTypes = token.fileTypes || []
  if (ext) {
    const type = {
      ext,
      source: 'path:filename'
    }

    const m = mime.lookup(ext)
    if (m) {
      type.mime = m
    }

    token.fileTypes.push(type)
  }
}

module.exports = analyzeType
