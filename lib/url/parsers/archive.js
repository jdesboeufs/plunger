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
const readdir = util.promisify(fs.readdir)

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

  const paths = await readdir(unarchivedPath)

  return {
    digest,
    paths: paths.map(p => path.join(unarchivedPath, p))
  }
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

async function parseArchive(token) {
  if (token.parsed) return false
  if (!isArchive(token)) return false

  const {paths, digest} = await extractArchive(token)
  if (paths.length > 0) {
    token.digest = digest
    token.type = 'archive'
    token.children = paths.map(location => ({
      inputType: 'file',
      location
    }))
    token.parsed = true
  }
}

module.exports = parseArchive
