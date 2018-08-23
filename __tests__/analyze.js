const path = require('path')
const analyze = require('../lib/analyze')
const options = require('../lib/options')

const {serveFile} = require('./__helpers__/server')

describe('analyze', () => {
  it('should analyze a text file completely', async () => {
    const filePath = path.resolve(__dirname, '__fixtures__/file.txt')
    const token = {
      inputType: 'path',
      path: filePath
    }

    await analyze(token, options)

    expect(token).toEqual({
      inputType: 'path',
      path: filePath,
      fileName: 'file.txt',
      fileTypes: [
        {ext: 'txt', mime: 'text/plain', source: 'path:filename'}
      ],
      type: 'file',
      digest: 'sha384-7I0Udziy5L9vXFrFCpp1k/se4t4BR01vimx/23rJRVgHcqUiWkxyUafAaXrLe4QF',
      fileSize: 13,
      analyzed: true
    })
  })

  it('should analyze an invalid path completely', async () => {
    const filePath = path.resolve(__dirname, '__fixtures__/not-found')
    const token = {
      inputType: 'path',
      path: filePath
    }

    await analyze(token, options)

    const {error} = token

    expect(token).toEqual({
      inputType: 'path',
      path: filePath,
      error,
      analyzed: true
    })
  })

  it('should analyze a directory completely', async () => {
    const filePath = path.resolve(__dirname, '__fixtures__/directory')
    const token = {
      inputType: 'path',
      path: filePath
    }

    await analyze(token, options)

    expect(token).toEqual({
      inputType: 'path',
      path: filePath,
      type: 'directory',
      children: [
        {
          inputType: 'path',
          path: path.join(filePath, '1.txt'),
          filePath: '1.txt',
          fileName: '1.txt',
          fileTypes: [{
            ext: 'txt',
            mime: 'text/plain',
            source: 'path:filename'
          }],
          type: 'file',
          digest: 'sha384-HQ8oTv4+3qS5yjvVFPoTSxfq42HMx6Hu/v+AG5vWYE4B8h9r8knvAwWZ8MIY8rqM',
          fileSize: 6,
          analyzed: true,
          fromUrl: undefined
        },
        {
          inputType: 'path',
          path: path.join(filePath, '2.txt'),
          filePath: '2.txt',
          fileName: '2.txt',
          fileTypes: [{
            ext: 'txt',
            mime: 'text/plain',
            source: 'path:filename'
          }],
          type: 'file',
          digest: 'sha384-vRZf1IRKUdDeUJ1lNsqndj+oIGoocD7v8XQWfhfKVmtm0CbNoclCeoWCCUs0fKpy',
          fileSize: 7,
          analyzed: true,
          fromUrl: undefined
        }
      ],
      analyzed: true
    })
  })

  it('should analyze an empty index-of completely', async () => {
    const url = await serveFile(path.resolve(__dirname, '__fixtures__/index-of/empty.html'))

    const token = {url}

    await analyze(token, options)

    expect(token).toEqual({
      analyzed: true,
      etag: token.etag,
      lastModified: token.lastModified,
      cacheControl: token.cacheControl,
      children: [],
      fileTypes: [{
        ext: 'html',
        mime: 'text/html',
        source: 'http:content-type'
      }],
      finalUrl: url + '/',
      redirectUrls: [],
      statusCode: 200,
      type: 'index-of',
      url
    })
  })

  it('should error if the inputType is not known', () => {
    const token = {inputType: 'unknown'}

    return expect(analyze(token, options)).rejects.toThrow('Token with inputType unknown was not analyzed')
  })
})
