const downloadFile = require('../download')
const {createTempDirectory} = require('../../util/tmpdir')

async function parseBody(token, options) {
  if (token.parsed) return false

  if (!token.temporary) {
    token.temporary = await createTempDirectory()
  }

  options.logger.log('file:download:start', token)
  const {filePath} = await downloadFile(token, options)
  options.logger.log('file:download:end', token)

  token.inputType = 'path'
  token.path = filePath
  token.reparse = true
}

module.exports = parseBody
