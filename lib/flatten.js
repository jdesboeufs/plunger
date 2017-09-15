const {remove} = require('lodash')

function getRelated(tokens, token, format) {
  return tokens.filter(t => {
    const extensionLess = token.fileName.slice(0, -token.fileType.ext.length - 1)

    return format.related.some(ext => t.fileName === `${extensionLess}.${ext}`)
  })
}

function matchPatterns(tokens, options) {
  const files = []
  const rest = [...tokens]

  options.formats.forEach(format => {
    const matchingTokens = rest.filter(token => format.extensions.some(ext => token.fileType.ext === ext))

    matchingTokens.forEach(token => {
      token.type = format.type
      remove(rest, token)

      if (format.format) {
        token.format = format.format
      }

      if (format.related && format.related.length > 0) {
        token.related = getRelated(tokens, token, format)
        token.related.forEach(token => remove(rest, token))
      }

      files.push(token)
    })
  })

  if (options.keepUnknownFiles) {
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
