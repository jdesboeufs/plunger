const path = require('path')

const fileType = require('file-type')
const contentType = require('content-type')
const mime = require('mime-types')

async function parseType(token, options) {
  if (token.parsed) return false

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
    token.fileType = type
    return
  }

  // Then, we try to extract the extension from the filename
  if (token.fileName) {
    const ext = path.extname(token.fileName).substring(1)

    token.fileType = {
      ext,
      mime: mime.lookup(ext)
    }
    return
  }

  // Finally, we retrieve the type from the content-type header
  const ct = contentType.parse(token.response)
  if (ct) {
    token.fileType = {
      ext: mime.extension(ct.type),
      mime: ct.type
    }
  }
}

module.exports = parseType
