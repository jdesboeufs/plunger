'use strict'

const {is} = require('type-is')
const {pipe} = require('mississippi')
const FeedParser = require('feedparser')

const bufferize = require('../bufferize')

function extractItems(token) {
  return new Promise((resolve, reject) => {
    const items = []

    const parser = pipe(token.response, new FeedParser(), error => {
      if (error) {
        if (error.message === 'Not a feed') {
          return resolve({isAtom: false})
        }

        return reject(error)
      }

      resolve({isAtom: true, items})
    })

    parser.on('readable', function () {
      let item

      while ((item = this.read())) {
        items.push(item)
      }
    })
  })
}

async function analyzeAtom(token, options) {
  if (token.analyzed) {
    return false
  }

  const canBeAtom = token.fileTypes.some(type => is(
    type.mime,
    'application/atom+xml',
    'text/xml',
    'application/xml'
  ))

  if (!canBeAtom) {
    return false
  }

  options.logger.log('atom:analyze:start', token)
  const {isAtom, items} = await bufferize(token, () => extractItems(token))
  options.logger.log('atom:analyze:end', token)

  if (isAtom) {
    token.type = 'atom'
    token.analyzed = true
    token.children = []

    if (items.length > 0) {
      token.children = items.map(item => ({
        inputType: 'url',
        url: item.link,
        meta: {
          title: item.title,
          description: item.description,
          summary: item.summary,
          author: item.author
        }
      }))
    }
  }
}

module.exports = analyzeAtom
