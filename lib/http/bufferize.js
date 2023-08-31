'use strict'
const {Buffer} = require('node:buffer')

async function bufferize(token, func) {
  const chunks = []
  token.response.on('data', chunk => {
    chunks.push(chunk)
  })

  const result = await func()

  if (chunks.length > 0) {
    token.buffer = chunks.length > 1 ? Buffer.concat(chunks) : chunks[0]
  }

  return result
}

module.exports = bufferize
