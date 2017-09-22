const test = require('ava')
const parseTypes = require('../../parsers/types')

test('should not update token if already analyzed', async t => {
  const token = {
    parsed: true
  }
  const save = Object.assign({}, token)

  const ret = await parseTypes(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})
