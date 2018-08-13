const path = require('path')
const {isArchive, unarchive} = require('../../lib/util/archive')
const {createTempDirectory} = require('../../lib/util/tmpdir')
const rm = require('../__helpers__/rm')

describe('util.archive', () => {
  it('should return false if there are no types specified', () => {
    expect(isArchive([])).toBeFalsy()
  })

  it('should return false if there are no archive types', () => {
    const types = [{
      ext: 'txt'
    }]

    expect(isArchive(types)).toBeFalsy()
  })

  it('should return false if there are no valid types', () => {
    const types = [{
    }]

    expect(isArchive(types)).toBeFalsy()
  })

  it('should return true if there is at least one archive type', () => {
    const types = [{
      ext: '7z'
    }]

    expect(isArchive(types)).toBeTruthy()
  })

  it('should error when trying to unarchive a file that does not exist', () => {
    return expect(
      unarchive(path.resolve(__dirname, '../__fixtures__/doesnt-exist'))
    ).rejects.toThrow('Could not extract archive')
  })

  it('should error when trying to unarchive an invalid archive', () => {
    return expect(
      unarchive(path.resolve(__dirname, '../__fixtures__/file.txt'))
    ).rejects.toThrow('Could not extract archive')
  })

  it('should extract an archive and return the unarchived path', async () => {
    const tmp = await unarchive(path.resolve(__dirname, '../__fixtures__/file.zip'))

    expect(tmp).toBe(path.resolve(__dirname, '../__fixtures__/_unarchived'))

    return rm(tmp)
  })

  it('should allow extracting in a different path', async () => {
    const tmp = await createTempDirectory()
    const ret = await unarchive(path.resolve(__dirname, '../__fixtures__/file.zip'), tmp)

    expect(ret).toBe(path.join(tmp, '_unarchived'))

    return rm(tmp)
  })
})
