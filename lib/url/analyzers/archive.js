'use strict'

const download = require('../download')
const {isArchive} = require('../../util/archive')
const {createTempDirectory} = require('../../util/tmpdir')

async function analyzeArchive(token, options) {
  if (token.analyzed) return false
  if (!isArchive(token.fileTypes)) return false

  if (!options.extractArchives) {
    token.type = 'archive'
    token.analyzed = true
    return
  }

  token.temporary = await createTempDirectory()

  options.logger.log('archive:download:start', token)
  const {digest, fileSize} = await download(token, options)
  options.logger.log('archive:download:end', token)

  token.digest = digest
  token.fileSize = fileSize
  token.type = 'archive'
  token.children = [{
    inputType: 'path',
    path: token.temporary
  }]
  token.analyzed = true
}

module.exports = analyzeArchive
