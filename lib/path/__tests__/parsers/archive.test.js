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

test('should not update token if it is not an archive', async t => {
  const token = {
    fileTypes: [
      {ext: 'txt', mime: 'text/plain'}
    ]
  }
  const save = Object.assign({}, token)

  const ret = await parseArchive(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should not extract archives if not specified in the options', async t => {
  const token = {
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ]
  }

  await parseArchive(token, {
    extractArchives: false
  })

  t.deepEqual(token, {
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    type: 'archive',
    parsed: true
  })
})
