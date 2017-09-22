const path = require('path')

const mime = require('mime-types')

function parseType(token) {
  const ext = path.extname(token.fileName).substring(1)

  const type = {
    ext,
    mime: mime.lookup(ext),
    source: 'path:filename'
  }
  token.fileTypes = token.fileTypes || []
  token.fileTypes.push(type)
}

module.exports = parseType
