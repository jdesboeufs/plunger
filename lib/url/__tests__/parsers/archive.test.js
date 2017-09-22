const test = require('ava')
const parseArchive = require('../../parsers/archive')

test('should not update token if already analyzed', async t => {
  const token = {
    parsed: true
  }
  const save = Object.assign({}, token)

  const ret = await parseArchive(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})
