const fs = require('fs')
const hasha = require('hasha')

const {getDigestString} = require('../../util/digest')

async function parseFile(token, options) {
  if (token.parsed) return false

  const digest = await hasha.fromStream(fs.createReadStream(token.location), {
    algorithm: options.digestAlgorithm
  })

  token.type = 'file'
  token.digest = getDigestString(digest, options.digestAlgorithm)
  token.fileSize = token.stats.size
  token.parsed = true
}

module.exports = parseFile
