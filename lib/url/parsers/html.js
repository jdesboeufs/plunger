'use strict'

const url = require('url')
const {is} = require('type-is')
const {pipe} = require('mississippi')
const htmlparser2 = require('htmlparser2')

async function extractLinks(token) {
  let isIndexOf = false
  const links = []

  let base = token.finalURL
  const parsedUrl = new url.URL(base)
  parsedUrl.pathname = '/'
  const rootUrl = parsedUrl.toString().slice(0, -1)

  const parser = new htmlparser2.WritableStream({
    ontext: text => {
      const matches = [
        /Directory of/,
        /Index of/
      ]

      if (matches.some(match => text.match(match))) {
        isIndexOf = true
      }
    },

    onopentag: (tag, attributes) => {
      if (tag === 'base' && attributes.href) {
        base = attributes.href
      }

      if (isIndexOf && tag === 'a' && attributes.href && !attributes.href.startsWith('.')) {
        const fullUrl = attributes.href.startsWith('/') ?
        `${rootUrl}${attributes.href}` :
        `${base}${attributes.href}`

        if (fullUrl.startsWith(base) && fullUrl !== base) {
          links.push(fullUrl)
        }
      }
    }
  })

  return new Promise((resolve, reject) => {
    pipe(
      token.response.body,
      parser,
      err => {
        if (err) return reject(err)

        resolve(links)
      }
    )
  })
}

async function parseIndexOf(token) {
  const links = await extractLinks(token)

  if (links.length > 0) {
    token.type = 'index-of'
    token.children = links.map(location => ({
      inputType: 'url',
      location
    }))
    token.parsed = true
  }
}

async function parseHTML(token) {
  if (token.parsed) return false
  if (!is(token.response, ['html'])) return false

  await parseIndexOf(token)
}

module.exports = parseHTML
