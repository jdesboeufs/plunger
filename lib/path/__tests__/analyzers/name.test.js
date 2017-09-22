const test = require('ava')
const analyzeName = require('../../analyzers/name')

test('should not update token if already analyzed', t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = analyzeName(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should use the basename of the path to set the fileName', t => {
  const token = {
    path: '/path/to/some/random/file.zip'
  }

  analyzeName(token)

  t.is(token.fileName, 'file.zip')
})
