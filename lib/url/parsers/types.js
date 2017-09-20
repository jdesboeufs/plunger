const path = require('path')

const fileType = require('file-type')
const contentType = require('content-type')
const mime = require('mime-types')

async function parseType(token, options) {
  if (token.parsed) return false

  const types = []

  // First, we read a chunk and try to infer the type with it
  const chunk = await new Promise((resolve, reject) => {
    const handle = setTimeout(
      () => reject(new Error('Timeout when trying to get first chunk')),
      options.fetchTimeout
    )
    token.response.body.once('data', firstChunk => {
      token.response.body.pause()
      clearTimeout(handle)
      token.response.body.unshift(firstChunk)
      resolve(firstChunk)
    }).resume()
  })

  const type = fileType(chunk)
  if (type) {
    type.source = 'chunk'
    types.push(type)
  }

  // Then, we retrieve the type from the content-type header
  const ct = contentType.parse(token.response)
  if (ct) {
    types.push({
      ext: mime.extension(ct.type),
      mime: ct.type,
      source: 'content-type'
    })
  }

  // Finally, we try to extract the extension from the filename
  if (token.fileName) {
    const ext = path.extname(token.fileName).substring(1)

    if (ext) {
      types.push({
        ext,
        mime: mime.lookup(ext),
        source: 'filename'
      })
    }
  }

  token.fileTypes = types
}

module.exports = parseType
