'use strict'

const {is} = require('type-is')
const FeedParser = require('feedparser')

const bufferize = require('../bufferize')

function extractItems(token) {
  const parser = new FeedParser()

  token.response.pipe(parser)

  return new Promise((resolve, reject) => {
    const items = []

    parser.on('readable', function () {
      let item

      while ((item = this.read())) {
        items.push(item)
      }
    })

    parser.on('error', err => {
      reject(err)
    })

    parser.on('end', () => {
      resolve(items)
    })
  })
}

async function analyzeAtom(token, options) {
  if (token.analyzed) {
    return false
  }

  const isAtom = token.fileTypes.some(type => is(type.mime, 'application/atom+xml'))
  if (!isAtom) {
    return false
  }

  options.logger.log('atom:analyze:start', token)
  const items = await bufferize(token, () => extractItems(token))
  options.logger.log('atom:analyze:end', token)

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
  token.type = 'atom'
  token.analyzed = true
}

module.exports = analyzeAtom
