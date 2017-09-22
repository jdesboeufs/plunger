const path = require('path')
const test = require('ava')
const parseDirectory = require('../directory')

test('should not update token if already analyzed', async t => {
  const token = {
    parsed: true
  }
  const save = Object.assign({}, token)

  const ret = await parseDirectory(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should return a child for each item in the directory', async t => {
  const token = {
    path: path.resolve(__dirname, '../../__tests__/fixtures/directory')
  }

  await parseDirectory(token)

  t.deepEqual(token.children, [
    {
      filePath: '1.txt',
      inputType: 'path',
      path: path.join(token.path, '1.txt')
    },
    {
      filePath: '2.txt',
      inputType: 'path',
      path: path.join(token.path, '2.txt')
    }
  ])
})

test('should set the token type to directory', async t => {
  const token = {
    path: path.resolve(__dirname, '../../__tests__/fixtures/directory')
  }

  await parseDirectory(token)

  t.is(token.type, 'directory')
})

test('should set the token as parsed', async t => {
  const token = {
    path: path.resolve(__dirname, '../../__tests__/fixtures/directory')
  }

  await parseDirectory(token)

  t.is(token.parsed, true)
})
