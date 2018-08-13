const path = require('path')
const analyzeTypes = require('../../../lib/path/analyzers/types')

describe('path.analyzers.file', () => {
  it('should not update token if already analyzed', async () => {
    const token = {
      analyzed: true
    }
    const save = Object.assign({}, token)

    const ret = await analyzeTypes(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })

  it('should not return any type when none detectable', async () => {
    const token = {
      path: path.resolve(__dirname, '../../__fixtures__/empty')
    }

    await analyzeTypes(token)

    expect(token.fileTypes).toHaveLength(0)
  })

  it('should error when the file is not found', () => {
    const token = {
      path: path.resolve(__dirname, '../../__fixtures__/notfound')
    }

    return expect(analyzeTypes(token)).rejects.toThrow(/ENOENT: no such file or directory/)
  })

  it('should use the fileName extension to add a fileType', async () => {
    const token = {
      path: path.resolve(__dirname, '../../__fixtures__/empty'),
      fileName: 'file.txt'
    }

    await analyzeTypes(token)

    expect(token.fileTypes).toEqual([{
      ext: 'txt',
      mime: 'text/plain',
      source: 'path:filename'
    }])
  })

  it('should not set a mime for unknown extensions', async () => {
    const token = {
      path: path.resolve(__dirname, '../../__fixtures__/empty'),
      fileName: 'file.lol'
    }

    await analyzeTypes(token)

    expect(token.fileTypes).toEqual([{
      ext: 'lol',
      mime: false,
      source: 'path:filename'
    }])
  })

  it('should not add a fileType when there is no extension', async () => {
    const token = {
      path: path.resolve(__dirname, '../../__fixtures__/empty'),
      fileName: 'file'
    }

    await analyzeTypes(token)

    expect(token.fileTypes).toHaveLength(0)
  })

  it('should detect file type with the first chunk', async () => {
    const token = {
      path: path.resolve(__dirname, '../../__fixtures__/file.zip')
    }

    await analyzeTypes(token)

    expect(token.fileTypes).toEqual([{
      ext: 'zip',
      mime: 'application/zip',
      source: 'path:chunk'
    }])
  })

  it('should preserve existing file types', async () => {
    const initialType = {
      ext: 'txt',
      mime: 'text/plain',
      source: 'test'
    }

    const token = {
      path: path.resolve(__dirname, '../../__fixtures__/empty'),
      fileName: 'file.csv',
      fileTypes: [initialType]
    }

    await analyzeTypes(token)

    expect(token.fileTypes).toEqual([
      initialType,
      {
        ext: 'csv',
        mime: 'text/csv',
        source: 'path:filename'
      }
    ])
  })
})
