'use strict'

const path = require('path')
const contentType = require('content-type')
const mime = require('mime-types')

function analyzeType(token) {
  if (token.analyzed) {
    return false
  }

  const types = []

  // We retrieve the type from the content-type header
  try {
    const ct = contentType.parse(token.response)
    types.push({
      ext: mime.extension(ct.type),
      mime: ct.type,
      source: 'http:content-type'
    })
  } catch (error) {
    // The Content-Type header was invalid, this is no big deal
    // We could log it to tell people that their headers are not valid
  }

  // Finally, we try to extract the extension from the filename
  if (token.fileName) {
    const ext = path.extname(token.fileName).substring(1)

    if (ext) {
      types.push({
        ext,
        mime: mime.lookup(ext),
        source: 'http:filename'
      })
    }
  }

  token.fileTypes = types
}

module.exports = analyzeType
