const test = require('ava')
const parseFile = require('../../parsers/file')

test('should not update token if already analyzed', async t => {
  const token = {
    parsed: true
  }
  const save = Object.assign({}, token)

  const ret = await parseFile(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})
