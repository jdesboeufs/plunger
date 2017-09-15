const _ = require('lodash')

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
      _.remove(rest, token)

      if (format.format) {
        token.format = format.format
      }

      if (format.related && format.related.length > 0) {
        token.related = getRelated(tokens, token, format)
        token.related.forEach(token => _.remove(rest, token))
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
  const files = matchPatterns(tokens.filter(token => token.type === 'file'), options)

  const containers = _(tokens)
    .filter(token => token.children)
    .map(token => flattenFiles(token.children, options))
    .value()

  return files.concat(...containers)
}

function flatten(token, options) {
  return flattenFiles([token], options)
}

module.exports = flatten
