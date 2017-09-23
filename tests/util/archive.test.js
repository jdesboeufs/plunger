const path = require('path')
const test = require('ava')
const {isArchive, unarchive} = require('../../lib/util/archive')
const {createTempDirectory} = require('../../lib/util/tmpdir')
const rm = require('../__helpers__/rm')

test('should return false if there are no types specified', t => {
  t.is(isArchive([]), false)
})

test('should return false if there are no archive types', t => {
  const types = [{
    ext: 'txt'
  }]

  t.is(isArchive(types), false)
})

test('should return false if there are no valid types', t => {
  const types = [{
  }]

  t.is(isArchive(types), false)
})

test('should return true if there is at least one archive type', t => {
  const types = [{
    ext: '7z'
  }]

  t.is(isArchive(types), true)
})

test('should error when trying to unarchive a file that does not exist', async t => {
  await t.throws(
    unarchive(path.resolve(__dirname, '../__fixtures__/doesnt-exist')),
    'Could not extract archive'
  )
})

test('should error when trying to unarchive an invalid archive', async t => {
  await t.throws(
    unarchive(path.resolve(__dirname, '../__fixtures__/file.txt')),
    'Could not extract archive'
  )
})

test('should extract an archive and return the unarchived path', async t => {
  const tmp = await unarchive(path.resolve(__dirname, '../__fixtures__/file.zip'))

  t.is(tmp, path.resolve(__dirname, '../__fixtures__/_unarchived'))

  return rm(tmp)
})

test('should allow extracting in a different path', async t => {
  const tmp = await createTempDirectory()
  const ret = await unarchive(path.resolve(__dirname, '../__fixtures__/file.zip'), tmp)

  t.is(ret, path.join(tmp, '_unarchived'))

  return rm(tmp)
})
