const fs = require('fs')
const path = require('path')
const {pipe} = require('mississippi')

const {bytesLimit, computeDigest} = require('../util/streams')

const {getDigestString} = require('../util/digest')

function getFileName(token) {
  if (token.fileName) {
    return token.fileName
  }

  if (token.fileTypes.length > 0) {
    const ext = token.fileTypes.find(ft => ft.ext).ext

    return `unknown.${ext}`
  }

  return 'unknown'
}

async function download(token, options) {
  const filePath = path.join(token.temporary, getFileName(token))

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
