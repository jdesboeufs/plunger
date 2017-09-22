const path = require('path')

function parseName(token) {
  token.fileName = path.basename(token.path)
}

module.exports = parseName
