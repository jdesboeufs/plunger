async function parseFile(token) {
  if (token.parsed) return false

  token.type = 'file'
  token.parsed = true
}

module.exports = parseFile
