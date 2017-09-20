const test = require('ava')
const parseBody = require('../body')

test('should not update token if already analyzed', async t => {
  const token = {
    parsed: true
  }
  const save = Object.assign({}, token)

  const ret = await parseBody(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})
