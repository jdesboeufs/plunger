const getStream = require('get-stream')
const hasha = require('hasha')

const {getDigestString} = require('../digest')

async function parseBody(token, options) {
  if (token.parsed) return false

  options.logger.log('file:download:start', token)
  const buffer = await getStream.buffer(token.response.body)
  options.logger.log('file:download:end', token)

  token.fileSize = buffer.length

  const digest = hasha(buffer, {algorithm: options.digestAlgorithm})
  token.digest = getDigestString(digest, options.digestAlgorithm)
  token.type = 'file'
  token.parsed = true
}

module.exports = parseBody
