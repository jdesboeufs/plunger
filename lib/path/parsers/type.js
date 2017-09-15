const path = require('path')

const mime = require('mime-types')

function parseType(token) {
  const ext = path.extname(token.fileName).substring(1)

  token.fileType = {
    ext,
    mime: mime.lookup(ext)
  }
}

module.exports = parseType
