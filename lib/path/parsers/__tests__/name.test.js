const test = require('ava')
const parseName = require('../name')

test('should not update token if already analyzed', t => {
  const token = {
    parsed: true
  }
  const save = Object.assign({}, token)

  const ret = parseName(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should use the basename of the path to set the fileName', t => {
  const token = {
    path: '/path/to/some/random/file.zip'
  }

  parseName(token)

  t.is(token.fileName, 'file.zip')
})
