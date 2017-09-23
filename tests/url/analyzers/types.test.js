const test = require('ava')
const analyzeTypes = require('../../../lib/url/analyzers/types')

test('should not update token if already analyzed', async t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = await analyzeTypes(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should extract the type from the content-type header', async t => {
  const token = {
    response: {
      headers: {
        'content-type': 'text/plain'
      }
    }
  }

  await analyzeTypes(token)

  t.deepEqual(token.fileTypes, [{
    ext: 'txt',
    mime: 'text/plain',
    source: 'url:content-type'
  }])
})

test('should not return an extension for unknown mime types', async t => {
  const token = {
    response: {
      headers: {
        'content-type': 'foo/bar'
      }
    }
  }

  await analyzeTypes(token)

  t.deepEqual(token.fileTypes, [{
    ext: false,
    mime: 'foo/bar',
    source: 'url:content-type'
  }])
})

test('should not return a type if the content type is not available', async t => {
  const token = {}

  await analyzeTypes(token)

  t.deepEqual(token.fileTypes, [])
})

test('should use the fileName extension to add a fileType', async t => {
  const token = {
    fileName: 'file.txt'
  }

  await analyzeTypes(token)

  t.deepEqual(token.fileTypes, [{
    ext: 'txt',
    mime: 'text/plain',
    source: 'url:filename'
  }])
})

test('should not set a mime for unknown extensions', async t => {
  const token = {
    fileName: 'file.lol'
  }

  await analyzeTypes(token)

  t.deepEqual(token.fileTypes, [{
    ext: 'lol',
    mime: false,
    source: 'url:filename'
  }])
})

test('should not add a fileType when there is no extension', async t => {
  const token = {
    fileName: 'file'
  }

  await analyzeTypes(token)

  t.deepEqual(token.fileTypes, [])
})

test('should return 2 types if content-type and fileName are available', async t => {
  const token = {
    fileName: 'file.txt',
    response: {
      headers: {
        'content-type': 'text/plain'
      }
    }
  }

  await analyzeTypes(token)

  t.deepEqual(token.fileTypes, [
    {
      ext: 'txt',
      mime: 'text/plain',
      source: 'url:content-type'
    },
    {
      ext: 'txt',
      mime: 'text/plain',
      source: 'url:filename'
    }
  ])
})
