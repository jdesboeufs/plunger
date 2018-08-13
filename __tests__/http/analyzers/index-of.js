const path = require('path')
const analyzeIndexOf = require('../../../lib/http/analyzers/index-of')
const fetch = require('../../../lib/http/fetch')

const {serveFile} = require('../../__helpers__/server')

const options = {
  userAgent: 'plunger/test',
  indexOfMatches: [
    /Index of/
  ],
  logger: {
    log: () => {}
  },
  timeout: {}
}

describe('http.analyzers.index-of', () => {
  it('should not update token if already analyzed', async () => {
    const token = {
      analyzed: true
    }
    const save = Object.assign({}, token)

    const ret = await analyzeIndexOf(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })

  it('should not parse url body if fileType does not contain types', async () => {
    const token = {
      fileTypes: []
    }

    expect(await analyzeIndexOf(token)).toBeFalsy()
  })

  it('should analyze content as an index of page', async () => {
    const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/basic.html'))

    const token = {
      url,
      fileTypes: [
        {mime: 'text/html'}
      ]
    }

    await fetch(token, options)
    await analyzeIndexOf(token, options)

    expect(token.analyzed).toBeTruthy()
    expect(token.type).toBe('index-of')
  })

  it('should not analyze as index of if no indexOfMatches are specified', async () => {
    const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/invalid-links.html'))

    const token = {
      url,
      fileTypes: [
        {mime: 'text/html'}
      ]
    }

    await fetch(token, options)
    await analyzeIndexOf(token, {
      logger: options.logger
    })

    expect(token.analyzed).toBeUndefined()
  })

  it('should not analyze as index of if not indexOfMatches match', async () => {
    const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/invalid-links.html'))

    const token = {
      url,
      fileTypes: [
        {mime: 'text/html'}
      ]
    }

    await fetch(token, options)
    await analyzeIndexOf(token, {
      logger: options.logger,
      indexOfMatches: [
        /Foo/
      ]
    })

    expect(token.analyzed).toBeUndefined()
  })

  it('should return an empty array of children for an empty index of', async () => {
    const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/empty.html'))

    const token = {
      url,
      fileTypes: [
        {mime: 'text/html'}
      ]
    }

    await fetch(token, options)
    await analyzeIndexOf(token, options)

    expect(token.children).toHaveLength(0)
  })

  it('should ignore invalid links', async () => {
    const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/invalid-links.html'))

    const token = {
      url,
      fileTypes: [
        {mime: 'text/html'}
      ]
    }

    await fetch(token, options)
    await analyzeIndexOf(token, options)

    expect(token.children).toHaveLength(0)
  })

  it('should ignore links if they’re not included within base', async () => {
    const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/base.html'))

    const token = {
      url,
      fileTypes: [
        {mime: 'text/html'}
      ]
    }

    await fetch(token, options)
    await analyzeIndexOf(token, options)

    expect(token.children).toHaveLength(0)
  })

  it('should return an array of children', async () => {
    const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/index-of/basic.html'))

    const token = {
      url,
      fileTypes: [
        {mime: 'text/html'}
      ]
    }

    await fetch(token, options)
    await analyzeIndexOf(token, options)

    expect(token.children).toEqual([
      {
        inputType: 'url',
        url: `${url}/file.txt`
      },
      {
        inputType: 'url',
        url: `${url}/file.zip`
      }
    ])
  })
})
