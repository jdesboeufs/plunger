const path = require('path')

function parseName(token) {
  token.fileName = path.basename(token.location)
}

module.exports = parseName
