'use strict'

const download = require('../download')
const {isArchive} = require('../../util/archive')
const {createTempDirectory} = require('../../util/tmpdir')

async function parseArchive(token, options) {
  if (token.parsed) return false
  if (!isArchive(token)) return false

  if (!options.extractArchives) {
    token.type = 'archive'
    token.parsed = true
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
    location: token.temporary
  }]
  token.parsed = true
}

module.exports = parseArchive
