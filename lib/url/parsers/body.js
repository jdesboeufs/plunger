const getStream = require('get-stream')
const hasha = require('hasha')

const {getDigestString} = require('../digest')

async function parseBody(token, options) {
  const buffer = await getStream.buffer(token.response.body)

  if (options.inlineTypes.includes(token.fileType.ext)) {
    token.body = buffer.toString('utf8')
  }

  token.fileSize = buffer.length

  const digest = hasha(buffer, {algorithm: options.digestAlgorithm})
  token.digest = getDigestString(digest, options.digestAlgorithm)
  token.parsed = true
}

module.exports = parseBody
