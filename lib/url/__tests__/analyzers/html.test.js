const test = require('ava')
const analyzeHtml = require('../../analyzers/html')

test('should not update token if already analyzed', async t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = await analyzeHtml(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})