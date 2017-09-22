const test = require('ava')
const parseUrl = require('..')

test('should not update token if already analyzed', async t => {
  const token = {
    parsed: true
  }
  const save = Object.assign({}, token)

  const ret = await parseUrl(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})