const test = require('ava')
const analyzeFile = require('../../../lib/path/analyzers/file')

test('should not update token if already analyzed', async t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = await analyzeFile(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should set the token type to file', async t => {
  const token = {
    digest: 'already computed'
  }

  await analyzeFile(token)

  t.is(token.type, 'file')
})

test('should set the token as analyzed', async t => {
  const token = {}

  await analyzeFile(token)

  t.is(token.analyzed, true)
})
