const path = require('path')
const test = require('ava')
const analyzeUrl = require('../../lib/url')

const {serveFile} = require('../__helpers__/server')
const rm = require('../__helpers__/rm')

const options = {
  userAgent: 'plunger/test',
  digestAlgorithm: 'md5',
  indexOfMatches: [
    /Index of/
  ],
  logger: {
    log: () => {}
  },
  timeout: {}
}

test('should not update token if already analyzed', async t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = await analyzeUrl(token)

  t.false(ret)
  t.deepEqual(token, save)
})

test('should analyze an index-of completely', async t => {
  const url = await serveFile(path.resolve(__dirname, '../__fixtures__/index-of/basic.html'))

  const token = {url}

  await analyzeUrl(token, options)

  const temporary = token.children[0].temporary

  t.deepEqual(token, {
    analyzed: true,
    children: [
      {
        inputType: 'url',
        temporary,
        url: `${url}/file.txt`
      },
      {
        inputType: 'url',
        temporary,
        url: `${url}/file.zip`
      }
    ],
    etag: token.etag,
    fileTypes: [{
      ext: 'html',
      mime: 'text/html',
      source: 'url:content-type'
    }],
    finalUrl: url,
    redirectUrls: [],
    statusCode: 200,
    type: 'index-of',
    url
  })

  return rm(temporary)
})
