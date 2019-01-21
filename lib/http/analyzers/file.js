'use strict'

const downloadFile = require('../download')
const {createTempDirectory} = require('../../util/tmpdir')

async function analyzeBody(token, options) {
  if (token.analyzed) {
    return false
  }

  if (!token.temporary) {
    token.temporary = await createTempDirectory()
  }

  options.logger.log('file:download:start', token)
  try {
    const {filePath, fileSize, digest} = await downloadFile(token, options)

    token.fileSize = fileSize
    token.digest = digest
    token.path = filePath
  } catch (error) {
    token.type = 'file'
    token.warning = error.message
    token.analyzed = true
  }

  options.logger.log('file:download:end', token)

  // After downloading the file, the token will be re-analyzed by the fs
  // file analyzer using `token.path`.
}

module.exports = analyzeBody
