const test = require('ava')
const parseAtom = require('../atom')

test('should not update token if already analyzed', async t => {
  const token = {
    parsed: true
  }
  const save = Object.assign({}, token)

  const ret = await parseAtom(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})
