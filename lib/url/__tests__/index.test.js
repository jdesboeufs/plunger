const test = require('ava')
const analyzeFile = require('..')

test('should not update token if already analyzed', async t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = await analyzeFile(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})
