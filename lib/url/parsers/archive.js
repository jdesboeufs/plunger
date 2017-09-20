'use strict'

const fs = require('fs')
const path = require('path')
const {pipe} = require('mississippi')

const {bytesLimit, computeDigest} = require('../../util/streams')
const {isArchive} = require('../../util/archive')
const {createTempDirectory} = require('../../util/tmpdir')

const {getDigestString} = require('../digest')

async function downloadFile(token, options) {
  const tmpDirectory = await createTempDirectory()
  const filePath = path.join(tmpDirectory.path, token.fileName)

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

async function parseArchive(token, options) {
  if (token.parsed) return false
  if (!isArchive(token)) return false

  if (!options.extractArchives) {
    token.response.destroy()
    token.type = 'archive'
    token.parsed = true
    return
  }

  options.logger.log('archive:download:start', token)
  const {filePath, digest} = await downloadFile(token, options)
  options.logger.log('archive:download:end', token)

  token.digest = digest
  token.type = 'archive'
  token.children = [{
    inputType: 'path',
    location: filePath,
    temporary: true,
    filePath: path.basename(filePath)
  }]
  token.parsed = true
}

module.exports = parseArchive
