const {remove, omit} = require('lodash')

function getRelated(tokens, token, type) {
  return tokens.filter(t => {
    const extensionless = token.fileName.slice(0, -token.fileType.ext.length - 1)

    return type.related.some(ext => t.fileName === `${extensionless}.${ext}`)
  })
}

function matchPatterns(tokens, options) {
  const files = []
  const rest = [...tokens]

  options.types.forEach(type => {
    const matchingTokens = rest.filter(token => type.extensions.some(ext => token.fileType.ext === ext))

    matchingTokens.forEach(token => {
      token.type = type.type
      remove(rest, token)

      if (type.format) {
        token.format = type.format
      }

      if (type.related && type.related.length > 0) {
        token.related = getRelated(tokens, token, type)
        token.related.forEach(token => remove(rest, token))
      }

      files.push(token)
    })
  })

  if (options.keepUnknownTypes) {
    return files.concat(rest.map(file => ({
      ...file,
      type: 'unknown'
    })))
  }

  return files
}

function flattenFiles(tokens, options) {
  const files = []

  const output = {
    files: [],
    unchanged: [],
    cacheable: [],
    errors: [],
    temporary: []
  }

  tokens.forEach(token => {
    const clean = omit(token, [
      'parsed',
      'children'
    ])

    if (token.type === 'error') {
      output.errors.push(clean)
      return
    }

    if (token.type === 'unchanged') {
      output.unchanged.push(clean)
      return
    }

    if (token.temporary) {
      output.temporary.push(clean)
    }

    if (token.type === 'file') {
      files.push(clean)
    }

    if (token.etag) {
      output.cacheable.push(clean)
    }

    if (token.children) {
      const childOutput = flattenFiles(token.children, options)

      output.files = output.files.concat(childOutput.files)
      output.unchanged = output.unchanged.concat(childOutput.unchanged)
      output.cacheable = output.cacheable.concat(childOutput.cacheable)
      output.errors = output.errors.concat(childOutput.errors)
      output.temporary = output.temporary.concat(childOutput.temporary)
    }
  })

  output.files = output.files.concat(
    matchPatterns(files, options)
  )

  return output
}

function flatten(token, options) {
  return flattenFiles([token], options)
}

module.exports = flatten
