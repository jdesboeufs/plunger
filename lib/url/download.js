'use strict'

const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const {pipe} = require('mississippi')
const hasha = require('hasha')

const {bytesLimit, computeDigest} = require('../util/streams')

const writeFile = promisify(fs.writeFile)

function getFileName(token) {
  if (token.fileName) {
    return token.fileName
  }

  if (token.fileTypes.length > 0) {
    const ext = token.fileTypes.find(ft => ft.ext).ext

    if (ext) {
      return `unknown.${ext}`
    }
  }

  return 'unknown'
}

async function download(token, options) {
  const filePath = path.join(token.temporary, getFileName(token))

  if (token.buffer) {
    await writeFile(filePath, token.buffer)
    const digest = hasha(token.buffer, {algorithm: options.digestAlgorithm, encoding: 'base64'})

    return {
      filePath,
      digest: `${options.digestAlgorithm}-${digest}`,
      fileSize: token.buffer.byteLength
    }
  }

  return new Promise((resolve, reject) => {
    let digest
    let fileSize

    const onDigest = result => {
      digest = result.digest
      fileSize = result.bodyLength
    }

    let downloadTimeout
    if (options.timeout.download) {
      downloadTimeout = setTimeout(() => {
        token.response.emit(
          'error',
          new Error(`The download of the file took longer than ${options.timeout.download}ms`)
        )
      }, options.timeout.download)
    }

    let activityTimeout
    if (options.timeout.activity) {
      const setActivityTimeout = () => setTimeout(() => {
        token.response.emit(
          'error',
          new Error(`Did not receive any data from the server for ${options.timeout.activity}ms`)
        )
      }, options.timeout.activity)

      activityTimeout = setActivityTimeout()
      token.response.on('data', () => {
        clearTimeout(activityTimeout)

        activityTimeout = setActivityTimeout()
      })
    }

    pipe(
      token.response,
      computeDigest(options.digestAlgorithm, onDigest),
      bytesLimit(options.maxDownloadSize),
      fs.createWriteStream(filePath),
      err => {
        clearTimeout(downloadTimeout)
        clearTimeout(activityTimeout)

        if (err) {
          token.response.destroy()
          return reject(err)
        }

        resolve({filePath, digest, fileSize})
      }
    )
  })
}

module.exports = download
