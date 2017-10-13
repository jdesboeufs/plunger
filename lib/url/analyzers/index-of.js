'use strict'

const url = require('url')
const {is} = require('type-is')
const {pipe} = require('mississippi')
const htmlparser = require('htmlparser2')
const normalize = require('normalize-url')

const {createTempDirectory} = require('../../util/tmpdir')
const bufferize = require('../bufferize')

function getBaseUrls(location) {
  const parsed = new url.URL(location)
  parsed.search = ''

  const baseUrl = parsed.toString()

  return {
    baseUrl: normalize(baseUrl, {
      stripWWW: false
    }),
    rootUrl: normalize(baseUrl, {
      stripWWW: false,
      removeDirectoryIndex: true
    })
  }
}

async function extractLinks(token, options) {
  let isIndexOf = false
  const links = []

  let {baseUrl, rootUrl} = getBaseUrls(token.finalUrl)

  const parser = new htmlparser.WritableStream({
    ontext: text => {
      const matches = options.indexOfMatches || []

      if (matches.some(match => text.match(match))) {
        isIndexOf = true
      }
    },

    onopentag: (tag, attributes) => {
      if (tag === 'base' && attributes.href) {
        baseUrl = attributes.href
      }

      if (isIndexOf && tag === 'a' && attributes.href) {
        const parsedUrl = url.parse(attributes.href)

        if (!parsedUrl.pathname) {
          parsedUrl.pathname = '/'
        }

        let fullUrl
        if (parsedUrl.protocol) {
          fullUrl = attributes.href
        } else if (parsedUrl.pathname.startsWith('/')) {
          fullUrl = `${rootUrl}${parsedUrl.pathname}`
        } else {
          fullUrl = `${baseUrl}/${parsedUrl.pathname}`
        }

        fullUrl = normalize(fullUrl, {
          stripWWW: false
        })

        if (fullUrl.startsWith(baseUrl) && fullUrl !== baseUrl) {
          links.push(fullUrl)
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
    const temporary = await createTempDirectory()

    token.type = 'index-of'
    token.children = links.map(url => ({
      inputType: 'url',
      url,
      temporary
    }))
    token.analyzed = true
  }
}

module.exports = analyzeIndexOf
