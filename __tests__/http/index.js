const path = require('path')
const analyzeUrl = require('../../lib/http')

const {serveFile} = require('../__helpers__/server')
const rm = require('../__helpers__/rm')

const options = {
  userAgent: 'plunger/test',
  digestAlgorithm: 'md5',
  indexOfMatches: [
    /Index of/
  ],
  logger: {
    log: () => {}
  },
  timeout: {}
}

describe('http', () => {
  it('should not update token if already analyzed', async () => {
    const token = {
      analyzed: true
    }
    const save = {...token}

    const ret = await analyzeUrl(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })

  it('should analyze an index-of completely', async () => {
    const url = await serveFile(path.resolve(__dirname, '../__fixtures__/index-of/basic.html'))

    const token = {url}

    await analyzeUrl(token, options)

    expect(token).toEqual({
      analyzed: true,
      children: [
        {
          inputType: 'url',
          url: `${url}/file.txt`
        },
        {
          inputType: 'url',
          url: `${url}/file.zip`
        }
      ],
      etag: token.etag,
      lastModified: token.lastModified,
      cacheControl: token.cacheControl,
      fileTypes: [{
        ext: 'html',
        mime: 'text/html',
        source: 'http:content-type'
      }],
      finalUrl: url,
      redirectUrls: [],
      statusCode: 200,
      type: 'index-of',
      url
    })
  })

  it('should allow overriding fetch options with cache.getUrlCache', async () => {
    const url = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

    const token = {url}

    await analyzeUrl(token, {...options, cache: {
      getUrlCache: token => {
        token.hacked = true
      }
    }})

    expect(token.hacked).toBeTruthy()

    return rm(token.temporary)
  })

  it('should call cache.settUrlCache to save url token data for caching purposes', async () => {
    const url = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

    const token = {url}

    await analyzeUrl(token, {...options, cache: {
      setUrlCache: token => {
        token.hacked = true
      }
    }})

    expect(token.hacked).toBeTruthy()

    return rm(token.temporary)
  })
})
