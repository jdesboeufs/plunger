const test = require('ava')
const {isArchive} = require('../archive')

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
