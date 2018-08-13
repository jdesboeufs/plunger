const path = require('path')
const analyzePath = require('../../lib/path')
const rm = require('../__helpers__/rm')

const options = {
  digestAlgorithm: 'md5',
  logger: {
    log: () => {}
  },
  extractArchives: true
}

describe('path', () => {
  it('should not update token if already analyzed', async () => {
    const token = {
      analyzed: true
    }
    const save = Object.assign({}, token)

    const ret = await analyzePath(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })

  it('should throw if the file is not found', () => {
    const token = {
      path: path.resolve(__dirname, '../__fixtures__/not-found.txt')
    }

    return expect(
      analyzePath(token, options)
    ).rejects.toThrow(/ENOENT: no such file or directory/)
  })

  it('should analyze a text file completely', async () => {
    const filePath = path.resolve(__dirname, '../__fixtures__/file.txt')

    const token = {
      path: filePath
    }

    await analyzePath(token, options)

    expect(token).toEqual({
      digest: 'md5-yJfRQQr48sdPuhGx21Eeng==',
      fileName: 'file.txt',
      fileSize: 13,
      fileTypes: [{
        ext: 'txt',
        mime: 'text/plain',
        source: 'path:filename'
      }],
      analyzed: true,
      path: filePath,
      type: 'file'
    })
  })

  it('should analyze a directory completely', async () => {
    const filePath = path.resolve(__dirname, '../__fixtures__/directory')

    const token = {
      path: filePath
    }

    await analyzePath(token, options)

    expect(token).toEqual({
      children: [
        {
          filePath: '1.txt',
          inputType: 'path',
          path: path.join(filePath, '1.txt'),
          fromUrl: undefined
        },
        {
          filePath: '2.txt',
          inputType: 'path',
          path: path.join(filePath, '2.txt'),
          fromUrl: undefined
        }
      ],
      analyzed: true,
      path: filePath,
      type: 'directory'
    })
  })

  it('should analyze an archive completely', async () => {
    const filePath = path.resolve(__dirname, '../__fixtures__/file.zip')

    const token = {
      path: filePath
    }

    await analyzePath(token, options)

    const tmp = token.temporary

    expect(token).toEqual({
      children: [
        {
          inputType: 'path',
          filePath: 'file.zip',
          path: path.join(tmp, '_unarchived'),
          fromUrl: undefined
        }
      ],
      analyzed: true,
      digest: 'md5-h6u6eX7aEtGSOMTyE5yQRQ==',
      path: filePath,
      fileTypes: [
        {
          ext: 'zip',
          mime: 'application/zip',
          source: 'path:chunk'
        },
        {
          ext: 'zip',
          mime: 'application/zip',
          source: 'path:filename'
        }
      ],
      temporary: tmp,
      fileName: 'file.zip',
      fileSize: 179,
      type: 'archive'
    })

    return rm(tmp)
  })

  it('should analyze an invalid archive completely', async () => {
    const filePath = path.resolve(__dirname, '../__fixtures__/invalid-archive.zip')

    const token = {
      path: filePath
    }

    await analyzePath(token, options)

    const tmp = token.temporary

    expect(token).toEqual({
      analyzed: true,
      path: filePath,
      digest: 'md5-oPAAyc9Y+DIU9H20eZGHqA==',
      fileTypes: [
        {
          ext: 'zip',
          mime: 'application/zip',
          source: 'path:filename'
        }
      ],
      temporary: tmp,
      fileName: 'invalid-archive.zip',
      fileSize: 23,
      type: 'file',
      warning: 'Could not extract archive'
    })

    return rm(tmp)
  })

  it('should error on unknown file types (symlink)', () => {
    const token = {
      path: path.resolve(__dirname, '../__fixtures__/link.txt')
    }

    return expect(
      analyzePath(token, options)
    ).rejects.toThrow('Unsupported file type')
  })

  it('should remove the stats from the token on error', async () => {
    const token = {
      path: path.resolve(__dirname, '../__fixtures__/link.txt')
    }

    await expect(
      analyzePath(token, options)
    ).rejects.toThrow('Unsupported file type')

    expect(token.stats).toBeUndefined()
  })

  it('should mark the file as unchanged if the cache is matched', async () => {
    const token = {
      path: path.resolve(__dirname, '../__fixtures__/file.txt')
    }

    await analyzePath(token, {
      ...options,
      cache: {
        getFileCache: () => true
      }
    })

    expect(token.unchanged).toBeTruthy()
    expect(token.analyzed).toBeTruthy()
  })
})
