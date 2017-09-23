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
