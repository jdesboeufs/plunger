const path = require('path')
const {promisify} = require('util')
const test = require('ava')
const rimraf = require('rimraf')
const {isArchive, unarchive} = require('../archive')
const {createTempDirectory} = require('../tmpdir')

const rm = promisify(rimraf)

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
    unarchive(path.resolve(__dirname, 'fixtures/doesnt-exist')),
    'Could not extract archive'
  )
})

test('should error when trying to unarchive an invalid archive', async t => {
  await t.throws(
    unarchive(path.resolve(__dirname, 'fixtures/non-archive.txt')),
    'Could not extract archive'
  )
})

test('should extract an archive and return the unarchived path', async t => {
  const tmp = await unarchive(path.resolve(__dirname, 'fixtures/archive.zip'))

  t.is(tmp, path.resolve(__dirname, 'fixtures/_unarchived'))

  return rm(tmp)
})

test('should allow extracting in a different path', async t => {
  const tmp = await createTempDirectory()
  const ret = await unarchive(path.resolve(__dirname, 'fixtures/archive.zip'), tmp)

  t.is(ret, path.join(tmp, '_unarchived'))

  return rm(tmp)
})
