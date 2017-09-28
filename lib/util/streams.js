'use strict'

const {createHash} = require('crypto')
const {through} = require('mississippi')

function computeDigest(algorithm, onDigest) {
  if (!onDigest) {
    throw new TypeError('onDigest is required')
  }

  const digester = createHash(algorithm)
  let size = 0

  return through(
    (chunk, enc, cb) => {
      digester.update(chunk)
      size += chunk.byteLength
      cb(null, chunk)
    },
    cb => {
      const digest = digester.digest('base64')

      onDigest({
        digest: `${algorithm}-${digest}`,
        bodyLength: size
      })
      cb()
    }
  )
}

function bytesLimit(limit) {
  if (!limit || !Number.isInteger(limit) || limit < 0) {
    throw new TypeError('limit must be a positive integer')
  }

  let readBytes = 0

  return through((chunk, enc, cb) => {
    readBytes += chunk.length
    if (readBytes <= limit) {
      cb(null, chunk)
    } else {
      cb(new Error('Content limit reached'))
    }
  })
}

module.exports = {bytesLimit, computeDigest}
