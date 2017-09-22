const fs = require('fs')
const path = require('path')
const {pipe} = require('mississippi')

const {bytesLimit, computeDigest} = require('../util/streams')

const {getDigestString} = require('./digest')

async function download(token, options) {
  const filePath = path.join(token.temporary, token.fileName || 'unknown')

  return new Promise((resolve, reject) => {
    let digest
    let fileSize

    const onDigest = result => {
      digest = getDigestString(result.digest, options.digestAlgorithm)
      fileSize = result.bodyLength
    }

    pipe(
      token.response.body,
      computeDigest(options.digestAlgorithm, onDigest),
      bytesLimit(100 * 1024 * 1024),
      fs.createWriteStream(filePath),
      err => {
        if (err) return reject(err)
        resolve({filePath, digest, fileSize})
      }
    )
  })
}

module.exports = download
