const {unarchive, isArchive} = require('../../util/archive')

async function parseArchive(token, options) {
  if (token.parsed) return false
  if (!isArchive(token.fileTypes)) return false

  if (!options.extractArchives) {
    token.type = 'archive'
    token.parsed = true
    return
  }

  options.logger.log('archive:extract:start', token)
  const unarchivePath = await unarchive(token.path)
  options.logger.log('archive:extract:end', token)

  token.type = 'archive'
  token.children = [{
    inputType: 'path',
    path: unarchivePath,
    filePath: token.filePath
  }]
  token.parsed = true
}

module.exports = parseArchive
