const path = require('path')

const mime = require('mime-types')

function parseType(token) {
  const ext = path.extname(token.fileName).substring(1)

  token.fileTypes = [{
    ext,
    mime: mime.lookup(ext),
    source: 'filename'
  }]
}

module.exports = parseType
