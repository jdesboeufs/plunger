const test = require('ava')
const parseType = require('../type')

test('should not update token if already analyzed', t => {
  const token = {
    parsed: true
  }
  const save = Object.assign({}, token)

  const ret = parseType(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should use the fileName extension to add a fileType', t => {
  const token = {
    fileName: 'file.zip'
  }

  parseType(token)

  t.deepEqual(token.fileTypes, [{
    ext: 'zip',
    mime: 'application/zip',
    source: 'path:filename'
  }])
})

test('should not set a mime for unknown extensions', t => {
  const token = {
    fileName: 'file.lol'
  }

  parseType(token)

  t.deepEqual(token.fileTypes, [{
    ext: 'lol',
    source: 'path:filename'
  }])
})

test('should not add a fileType when there is no extension', t => {
  const token = {
    fileName: 'file'
  }

  parseType(token)

  t.deepEqual(token.fileTypes, [])
})
