const path = require('path')
const test = require('ava')
const analyzeTypes = require('../../analyzers/types')

test('should not update token if already analyzed', async t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = await analyzeTypes(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should not return any type when none detectable', async t => {
  const token = {
    path: path.resolve(__dirname, '../fixtures/empty')
  }

  await analyzeTypes(token)

  t.deepEqual(token.fileTypes, [])
})

test('should error when the file is not found', async t => {
  const token = {
    path: path.resolve(__dirname, '../fixtures/notfound')
  }

  await t.throws(analyzeTypes(token), /ENOENT: no such file or directory/)
})

test('should use the fileName extension to add a fileType', async t => {
  const token = {
    path: path.resolve(__dirname, '../fixtures/empty'),
    fileName: 'file.txt'
  }

  await analyzeTypes(token)

  t.deepEqual(token.fileTypes, [{
    ext: 'txt',
    mime: 'text/plain',
    source: 'path:filename'
  }])
})

test('should not set a mime for unknown extensions', async t => {
  const token = {
    path: path.resolve(__dirname, '../fixtures/empty'),
    fileName: 'file.lol'
  }

  await analyzeTypes(token)

  t.deepEqual(token.fileTypes, [{
    ext: 'lol',
    mime: false,
    source: 'path:filename'
  }])
})

test('should not add a fileType when there is no extension', async t => {
  const token = {
    path: path.resolve(__dirname, '../fixtures/empty'),
    fileName: 'file'
  }

  await analyzeTypes(token)

  t.deepEqual(token.fileTypes, [])
})

test('should detect file type with the first chunk', async t => {
  const token = {
    path: path.resolve(__dirname, '../fixtures/file.zip')
  }

  await analyzeTypes(token)

  t.deepEqual(token.fileTypes, [{
    ext: 'zip',
    mime: 'application/zip',
    source: 'path:chunk'
  }])
})
