const path = require('path')
const analyzeArchive = require('../../../lib/path/analyzers/archive')
const {createTempDirectory} = require('../../../lib/util/tmpdir')
const rm = require('../../__helpers__/rm')

const options = {
  logger: {
    log: () => {}
  },
  extractArchives: true
}

describe('path.analyzers.archive', () => {
  it('should not update token if already analyzed', async () => {
    const token = {
      analyzed: true
    }
    const save = {...token}

    const ret = await analyzeArchive(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })

  it('should not update token if it is not an archive', async () => {
    const token = {
      fileTypes: [
        {ext: 'txt', mime: 'text/plain'}
      ]
    }
    const save = {...token}

    const ret = await analyzeArchive(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })

  it('should not extract archives if not specified in the options', async () => {
    const token = {
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ]
    }

    await analyzeArchive(token, {
      extractArchives: false
    })

    expect(token).toEqual({
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      type: 'archive',
      analyzed: true
    })
  })

  it('should extract an archive and add a child with the extracted folder', async () => {
    const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')

    const token = {
      path: filePath,
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ]
    }

    await analyzeArchive(token, options)

    const tmp = token.temporary

    expect(token).toEqual({
      path: filePath,
      analyzed: true,
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      children: [
        {
          filePath: undefined,
          inputType: 'path',
          path: path.join(tmp, '_unarchived'),
          fromUrl: undefined
        }
      ],
      type: 'archive',
      temporary: tmp
    })

    return rm(tmp)
  })

  it('should pass the filePath when specified', async () => {
    const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')

    const token = {
      path: filePath,
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      filePath: 'somepath/hello.zip/file.zip'
    }

    await analyzeArchive(token, options)

    const tmp = token.temporary

    expect(token).toEqual({
      path: filePath,
      analyzed: true,
      filePath: 'somepath/hello.zip/file.zip',
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      children: [
        {
          filePath: 'somepath/hello.zip/file.zip',
          inputType: 'path',
          path: path.join(tmp, '_unarchived'),
          fromUrl: undefined
        }
      ],
      type: 'archive',
      temporary: tmp
    })

    return rm(tmp)
  })

  it('should use the fileName when filePath is not specified', async () => {
    const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')

    const token = {
      path: filePath,
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      fileName: 'file.zip'
    }

    await analyzeArchive(token, options)

    const tmp = token.temporary

    expect(token).toEqual({
      path: filePath,
      analyzed: true,
      fileName: 'file.zip',
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      children: [
        {
          filePath: 'file.zip',
          inputType: 'path',
          path: path.join(tmp, '_unarchived'),
          fromUrl: undefined
        }
      ],
      type: 'archive',
      temporary: tmp
    })

    return rm(tmp)
  })

  it('should use the specified temporary path when available', async () => {
    const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')
    const tmp = await createTempDirectory()

    const token = {
      path: filePath,
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      temporary: tmp
    }

    await analyzeArchive(token, options)

    expect(token.temporary).toEqual(tmp)
    expect(token.children[0].path.startsWith(tmp)).toBeTruthy()

    return rm(tmp)
  })

  it('should not mark invalid archives as analyzed and pass a warning message', async () => {
    const filePath = path.resolve(__dirname, '../../__fixtures__/invalid-archive.zip')
    const token = {
      path: filePath,
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ]
    }

    await analyzeArchive(token, options)

    const tmp = token.temporary

    expect(token).toEqual({
      path: filePath,
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      warning: 'Could not extract archive',
      temporary: tmp
    })

    return rm(tmp)
  })

  it('should pass the url down to children', async () => {
    const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')

    const token = {
      path: filePath,
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      fileName: 'file.zip',
      url: 'foo'
    }

    await analyzeArchive(token, options)

    const tmp = token.temporary

    expect(token).toEqual({
      url: 'foo',
      path: filePath,
      analyzed: true,
      fileName: 'file.zip',
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      children: [
        {
          filePath: 'file.zip',
          inputType: 'path',
          path: path.join(tmp, '_unarchived'),
          fromUrl: 'foo'
        }
      ],
      type: 'archive',
      temporary: tmp
    })

    return rm(tmp)
  })

  it('should pass the fromUrl down to children', async () => {
    const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')

    const token = {
      path: filePath,
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      fileName: 'file.zip',
      fromUrl: 'foo'
    }

    await analyzeArchive(token, options)

    const tmp = token.temporary

    expect(token).toEqual({
      fromUrl: 'foo',
      path: filePath,
      analyzed: true,
      fileName: 'file.zip',
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      children: [
        {
          filePath: 'file.zip',
          inputType: 'path',
          path: path.join(tmp, '_unarchived'),
          fromUrl: 'foo'
        }
      ],
      type: 'archive',
      temporary: tmp
    })

    return rm(tmp)
  })

  it('should prioritize url over fromUrl when passing them down to children', async () => {
    const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')

    const token = {
      path: filePath,
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      fileName: 'file.zip',
      url: 'foo',
      fromUrl: 'bar'
    }

    await analyzeArchive(token, options)

    const tmp = token.temporary

    expect(token).toEqual({
      url: 'foo',
      fromUrl: 'bar',
      path: filePath,
      analyzed: true,
      fileName: 'file.zip',
      fileTypes: [
        {ext: 'zip', mime: 'application/zip'}
      ],
      children: [
        {
          filePath: 'file.zip',
          inputType: 'path',
          path: path.join(tmp, '_unarchived'),
          fromUrl: 'foo'
        }
      ],
      type: 'archive',
      temporary: tmp
    })

    return rm(tmp)
  })
})
