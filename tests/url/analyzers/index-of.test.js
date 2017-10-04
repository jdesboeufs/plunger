const test = require('ava')
const analyzeIndexOf = require('../../../lib/url/analyzers/index-of')

test('should not update token if already analyzed', async t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = await analyzeIndexOf(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})
