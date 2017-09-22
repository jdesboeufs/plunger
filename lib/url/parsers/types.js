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
    token.response.body.once('data', chunk => {
      token.response.body.pause()
      token.response.body.unshift(chunk)
      clearTimeout(handle)
      resolve(chunk)
    }).resume()
  })

  const type = fileType(chunk)
  if (type) {
    type.source = 'url:chunk'
    types.push(type)
  }

  // Then, we retrieve the type from the content-type header
  try {
    const ct = contentType.parse(token.response)
    if (ct) {
      types.push({
        ext: mime.extension(ct.type),
        mime: ct.type,
        source: 'url:content-type'
      })
    }
  } catch (err) {
    // The Content-Type header was invalid, this is no big deal
    // We could log it to tell people that their headers are not valid
  }

  // Finally, we try to extract the extension from the filename
  if (token.fileName) {
    const ext = path.extname(token.fileName).substring(1)

    if (ext) {
      types.push({
        ext,
        mime: mime.lookup(ext),
        source: 'url:filename'
      })
    }
  }

  token.fileTypes = types
}

module.exports = parseType
