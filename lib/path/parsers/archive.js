const {unarchive, isArchive} = require('../../util/archive')

async function parseArchive(token) {
  if (token.parsed) return false
  if (!isArchive(token)) return false

  const location = await unarchive(token.location)

  token.type = 'archive'
  token.children = [{
    inputType: 'path',
    location,
    temporary: true,
    filePath: token.fileName
  }]
  token.parsed = true
}

module.exports = parseArchive
