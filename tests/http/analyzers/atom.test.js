const path = require('path')
const test = require('ava')
const analyzeAtom = require('../../../lib/http/analyzers/atom')
const fetch = require('../../../lib/http/fetch')

const {serveFile} = require('../../__helpers__/server')

const options = {
  userAgent: 'plunger/test',
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

  const ret = await analyzeAtom(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should not parse url body if fileType does not contain types', async t => {
  const token = {
    fileTypes: []
  }

  t.is(await analyzeAtom(token), false)
})

test('should analyze content as an atom feed', async t => {
  const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/atom.xml'))

  const token = {
    url,
    fileTypes: [
      {mime: 'application/atom+xml'}
    ]
  }

  await fetch(token, options)
  await analyzeAtom(token, options)

  t.true(token.analyzed)
  t.is(token.type, 'atom')
})

test('should extract children from the atom feed', async t => {
  const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/atom.xml'))

  const token = {
    url,
    fileTypes: [
      {mime: 'application/atom+xml'}
    ]
  }

  await fetch(token, options)
  await analyzeAtom(token, options)

  t.deepEqual(token.children, [
    {
      inputType: 'url',
      meta: {
        author: 'Test runner',
        description: null,
        summary: null,
        title: 'File 1'
      },
      url: '/file.txt'
    },
    {
      inputType: 'url',
      meta: {
        author: 'Test runner',
        description: null,
        summary: null,
        title: 'Zip file'
      },
      url: '/file.zip'
    }
  ])
})

test('should not extract any child for an empty atom feed', async t => {
  const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/atom-empty.xml'))

  const token = {
    url,
    fileTypes: [
      {mime: 'application/atom+xml'}
    ]
  }

  await fetch(token, options)
  await analyzeAtom(token, options)

  t.true(token.analyzed)
  t.is(token.type, 'atom')
  t.deepEqual(token.children, undefined)
})

test('should fail for non atom feeds', async t => {
  const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/file.txt'))

  const token = {
    url,
    fileTypes: [
      {mime: 'application/atom+xml'}
    ]
  }

  await fetch(token, options)

  return t.throws(analyzeAtom(token, options), 'Not a feed')
})
