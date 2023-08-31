'use strict'

const {unarchive, isArchive} = require('../../util/archive')
const {createTempDirectory} = require('../../util/tmpdir')

async function analyzeArchive(token, options) {
  if (token.analyzed) {
    return false
  }

  if (!isArchive(token.fileTypes)) {
    return false
  }

  if (!options.extractArchives) {
    token.type = 'archive'
    token.analyzed = true
    return
  }

  if (!token.temporary) {
    token.temporary = await createTempDirectory()
  }

  let unarchivePath
  options.logger.log('archive:extract:start', token)
  try {
    unarchivePath = await unarchive(token.path, token.temporary)
  } catch (error) {
    // The archive could not be extracted, so we’re treating the file
    // as a regular file, but we’re attaching a warning message.
    token.warning = error.message
    return
  }

  options.logger.log('archive:extract:end', token)

  token.type = 'archive'
  token.children = [{
    inputType: 'path',
    path: unarchivePath,
    filePath: token.filePath || token.fileName,
    fromUrl: token.url || token.fromUrl
  }]
  token.analyzed = true
}

module.exports = analyzeArchive
