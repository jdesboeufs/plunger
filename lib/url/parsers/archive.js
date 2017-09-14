'use strict'

const util = require('util')
const path = require('path')
const fs = require('fs')
const execa = require('execa')
const {pipe} = require('mississippi')

const {createTempDirectory} = require('../../util/tmpdir')
const {bytesLimit, computeDigest} = require('../../util/streams')

const {getDigestString} = require('../digest')

const mkdir = util.promisify(fs.mkdir)

function downloadFile(path, body, algorithm) {
  return new Promise((resolve, reject) => {
    let digest
    let fileSize

    const onDigest = result => {
      digest = getDigestString(result.digest, algorithm)
      fileSize = result.bodyLength
    }

    pipe(
      body,
      computeDigest(algorithm, onDigest),
      bytesLimit(100 * 1024 * 1024),
      fs.createWriteStream(path),
      err => {
        if (err) return reject(err)
        resolve({digest, fileSize})
      }
    )
  })
}

async function extractArchive(token, options) {
  const tmpDirectory = await createTempDirectory()
  const filePath = path.join(tmpDirectory.path, token.fileName)
  const {digest} = await downloadFile(filePath, token.response.body, options.digestAlgorithm)
  const unarchivedPath = path.join(tmpDirectory.path, 'unarchived')

  await mkdir(unarchivedPath)
  await execa('unar', ['-no-directory', '-output-directory', unarchivedPath, filePath])

  return {location: unarchivedPath, digest}
}

function isArchive(token) {
  return token.fileType && [
    'zip',
    'tar',
    'rar',
    'gz',
    'bz2',
    '7z',
    'xz',
    'exe'
  ].includes(token.fileType.ext)
}

async function parseArchive(token, options) {
  if (token.parsed) return false
  if (!isArchive(token)) return false

  const {location, digest} = await extractArchive(token, options)

  token.digest = digest
  token.type = 'archive'
  token.children = [{
    inputType: 'path',
    location,
    temporary: true
  }]
  token.parsed = true
}

module.exports = parseArchive
