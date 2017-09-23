'use strict'

const path = require('path')
const mime = require('mime-types')
const readChunk = require('read-chunk')
const fileType = require('file-type')

async function analyzeType(token) {
  if (token.analyzed) return false

  const types = []

  const chunk = await readChunk(token.path, 0, 4100)
  const type = fileType(chunk)
  if (type) {
    type.source = 'path:chunk'
    types.push(type)
  }

  // Finally, we try to extract the extension from the filename
  if (token.fileName) {
    const ext = path.extname(token.fileName).substring(1)
    if (ext) {
      const type = {
        ext,
        mime: mime.lookup(ext),
        source: 'path:filename'
      }

      types.push(type)
    }
  }

  token.fileTypes = token.fileTypes ? token.fileTypes.concat(types) : types
}

module.exports = analyzeType
