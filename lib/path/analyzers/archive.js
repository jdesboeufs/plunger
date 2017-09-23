'use strict'

const {unarchive, isArchive} = require('../../util/archive')
const {createTempDirectory} = require('../../util/tmpdir')

async function analyzeArchive(token, options) {
  if (token.analyzed) return false
  if (!isArchive(token.fileTypes)) return false

  if (!options.extractArchives) {
    token.type = 'archive'
    token.analyzed = true
    return
  }

  if (!token.temporary) {
    token.temporary = await createTempDirectory()
  }

  options.logger.log('archive:extract:start', token)
  const unarchivePath = await unarchive(token.path, token.temporary)
  options.logger.log('archive:extract:end', token)

  token.type = 'archive'
  token.children = [{
    inputType: 'path',
    path: unarchivePath,
    filePath: token.filePath || token.fileName
  }]
  token.analyzed = true
}

module.exports = analyzeArchive
