const path = require('path')
const test = require('ava')
const analyzeIndexOf = require('../../../lib/url/analyzers/index-of')
const fetch = require('../../../lib/url/fetch')

const {serveFile} = require('../../__helpers__/server')
const rm = require('../../__helpers__/rm')

const options = {
  userAgent: 'plunger/test',
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

  const ret = await analyzeIndexOf(token)

  t.false(ret)
  t.deepEqual(token, save)
})

test('should not parse url body if fileType does not contain types', async t => {
  const token = {
    fileTypes: []
  }

  t.false(await analyzeIndexOf(token))
})

test('should analyze content as an index of page', async t => {
  const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/basic.html'))

  const token = {
    url,
    fileTypes: [
      {mime: 'text/html'}
    ]
  }

  await fetch(token, options)
  await analyzeIndexOf(token, options)

  t.true(token.analyzed)
  t.is(token.type, 'index-of')

  return rm(token.children[0].temporary)
})

test('should not analyze as index of if no indexOfMatches are specified', async t => {
  const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/invalid-links.html'))

  const token = {
    url,
    fileTypes: [
      {mime: 'text/html'}
    ]
  }

  await fetch(token, options)
  await analyzeIndexOf(token, {
    logger: options.logger
  })

  t.is(token.analyzed, undefined)
})

test('should not analyze as index of if not indexOfMatches match', async t => {
  const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/invalid-links.html'))

  const token = {
    url,
    fileTypes: [
      {mime: 'text/html'}
    ]
  }

  await fetch(token, options)
  await analyzeIndexOf(token, {
    logger: options.logger,
    indexOfMatches: [
      /Foo/
    ]
  })

  t.is(token.analyzed, undefined)
})

test('should return an empty array of children for an empty index of', async t => {
  const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/empty.html'))

  const token = {
    url,
    fileTypes: [
      {mime: 'text/html'}
    ]
  }

  await fetch(token, options)
  await analyzeIndexOf(token, options)

  t.deepEqual(token.children, [])
})

test('should ignore invalid links', async t => {
  const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/invalid-links.html'))

  const token = {
    url,
    fileTypes: [
      {mime: 'text/html'}
    ]
  }

  await fetch(token, options)
  await analyzeIndexOf(token, options)

  t.deepEqual(token.children, [])
})

test('should ignore links if they’re not included within base', async t => {
  const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/base.html'))

  const token = {
    url,
    fileTypes: [
      {mime: 'text/html'}
    ]
  }

  await fetch(token, options)
  await analyzeIndexOf(token, options)

  t.deepEqual(token.children, [])
})

test('should return an array of children', async t => {
  const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/basic.html'))

  const token = {
    url,
    fileTypes: [
      {mime: 'text/html'}
    ]
  }

  await fetch(token, options)
  await analyzeIndexOf(token, options)

  const [{temporary}] = token.children

  t.deepEqual(token.children, [
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
  ])

  return rm(temporary)
})
