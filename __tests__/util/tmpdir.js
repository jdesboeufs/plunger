const os = require('os')
const path = require('path')
const tmpdir = require('../../lib/util/tmpdir')
const rm = require('../__helpers__/rm')

const ostmpdir = os.tmpdir()

describe('util.streams', () => {
  it('should create a tmp directory prefixed with plunger_', async () => {
    const tmp = await tmpdir.createTempDirectory()

    expect(
      tmp.startsWith(path.join(ostmpdir, 'plunger_'))
    ).toBeTruthy()

    return rm(tmp)
  })

  it('should change the prefix when specified', async () => {
    const tmp = await tmpdir.createTempDirectory('hello')

    expect(
      tmp.startsWith(path.join(ostmpdir, 'hello'))
    ).toBeTruthy()

    return rm(tmp)
  })
})
