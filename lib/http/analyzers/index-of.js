'use strict'

const url = require('url')
const {is} = require('type-is')
const {pipe} = require('mississippi')
const htmlparser = require('htmlparser2')
const normalize = require('normalize-url')

const bufferize = require('../bufferize')

function stripQuery(location) {
  const parsed = new url.URL(location)
  parsed.search = ''

  try {
    return normalize(parsed.toString(), {
      stripWWW: false,
      removeTrailingSlash: false,
      stripHash: true
    })
  } catch (error) {
    // Url could not be normalized, return original URL.
    // See https://github.com/sindresorhus/normalize-url/issues/24
    return parsed.toString()
  }
}

function extractLinks(token, options) {
  let isIndexOf = false
  const links = []

  let baseUrl = stripQuery(token.finalUrl)

  const parser = new htmlparser.WritableStream({
    ontext: text => {
      const matches = options.indexOfMatches || []

      if (matches.some(match => text.trim().match(match))) {
        isIndexOf = true
      }
    },

    onopentag: (tag, attributes) => {
      if (tag === 'base' && attributes.href) {
        baseUrl = stripQuery(url.resolve(baseUrl, attributes.href)) // eslint-disable-line node/no-deprecated-api
      }

      if (isIndexOf && tag === 'a' && attributes.href) {
        const resolved = stripQuery(url.resolve(baseUrl, attributes.href)) // eslint-disable-line node/no-deprecated-api

        if (resolved !== baseUrl && resolved.startsWith(baseUrl)) {
          links.push(resolved)
        }
      }
    }
  })

  return new Promise((resolve, reject) => {
    pipe(
      token.response,
      parser,
      err => {
        if (err) {
          return reject(err)
        }

        resolve({isIndexOf, links})
      }
    )
  })
}

async function analyzeIndexOf(token, options) {
  if (token.analyzed) {
    return false
  }

  const isHtml = token.fileTypes.some(type => is(type.mime, 'html'))
  if (!isHtml) {
    return false
  }

  options.logger.log('index-of:analyze:start', token)
  const {isIndexOf, links} = await bufferize(token, () => extractLinks(token, options))
  options.logger.log('index-of:analyze:end', token)

  if (isIndexOf) {
    token.type = 'index-of'
    token.analyzed = true
    token.children = []

    if (links.length > 0) {
      token.children = links.map(url => ({
        inputType: 'url',
        url
      }))
    }
  }
}

module.exports = analyzeIndexOf
