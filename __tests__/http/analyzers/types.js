const analyzeTypes = require('../../../lib/http/analyzers/types')

describe('http.analyzers.types', () => {
  it('should not update token if already analyzed', async () => {
    const token = {
      analyzed: true
    }
    const save = {...token}

    const ret = await analyzeTypes(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })

  it('should extract the type from the content-type header', async () => {
    const token = {
      response: {
        headers: {
          'content-type': 'text/plain'
        }
      }
    }

    await analyzeTypes(token)

    expect(token.fileTypes).toEqual([{
      ext: 'txt',
      mime: 'text/plain',
      source: 'http:content-type'
    }])
  })

  it('should not return an extension for unknown mime types', async () => {
    const token = {
      response: {
        headers: {
          'content-type': 'foo/bar'
        }
      }
    }

    await analyzeTypes(token)

    expect(token.fileTypes).toEqual([{
      ext: false,
      mime: 'foo/bar',
      source: 'http:content-type'
    }])
  })

  it('should not return a type if an error occurs', async () => {
    const token = {}

    await analyzeTypes(token)

    expect(token.fileTypes).toHaveLength(0)
  })

  it('should use the fileName extension to add a fileType', async () => {
    const token = {
      fileName: 'file.txt'
    }

    await analyzeTypes(token)

    expect(token.fileTypes).toEqual([{
      ext: 'txt',
      mime: 'text/plain',
      source: 'http:filename'
    }])
  })

  it('should not set a mime for unknown extensions', async () => {
    const token = {
      fileName: 'file.lol'
    }

    await analyzeTypes(token)

    expect(token.fileTypes).toEqual([{
      ext: 'lol',
      mime: false,
      source: 'http:filename'
    }])
  })

  it('should not add a fileType when there is no extension', async () => {
    const token = {
      fileName: 'file'
    }

    await analyzeTypes(token)

    expect(token.fileTypes).toHaveLength(0)
  })

  it('should return 2 types if content-type and fileName are available', async () => {
    const token = {
      fileName: 'file.txt',
      response: {
        headers: {
          'content-type': 'text/plain'
        }
      }
    }

    await analyzeTypes(token)

    expect(token.fileTypes).toEqual([
      {
        ext: 'txt',
        mime: 'text/plain',
        source: 'http:content-type'
      },
      {
        ext: 'txt',
        mime: 'text/plain',
        source: 'http:filename'
      }
    ])
  })
})
