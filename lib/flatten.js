const {remove} = require('lodash')

function getRelated(tokens, token, type) {
  return tokens.filter(t => {
    const extensionLess = token.fileName.slice(0, -token.fileType.ext.length - 1)

    return type.related.some(ext => t.fileName === `${extensionLess}.${ext}`)
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
    return files.concat(rest.map(file => Object.assign(file, {
      type: 'unknown'
    })))
  }

  return files
}

function flattenFiles(tokens, options) {
  const output = {
    files: matchPatterns(tokens.filter(token => token.type === 'file'), options),
    errors: tokens.filter(token => token.type === 'error')
  }

  tokens
    .filter(token => token.children)
    .forEach(token => {
      const childOutput = flattenFiles(token.children, options)

      output.files = output.files.concat(childOutput.files)
      output.errors = output.errors.concat(childOutput.errors)
    })

  return output
}

function flatten(token, options) {
  return flattenFiles([token], options)
}

module.exports = flatten
