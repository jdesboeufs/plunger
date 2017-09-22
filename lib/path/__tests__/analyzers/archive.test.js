const test = require('ava')
const analyzeArchive = require('../../analyzers/archive')

test('should not update token if already analyzed', async t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = await analyzeArchive(token)

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

  const ret = await analyzeArchive(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should not extract archives if not specified in the options', async t => {
  const token = {
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ]
  }

  await analyzeArchive(token, {
    extractArchives: false
  })

  t.deepEqual(token, {
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    type: 'archive',
    analyzed: true
  })
})
