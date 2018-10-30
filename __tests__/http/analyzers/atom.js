const path = require('path')
const analyzeAtom = require('../../../lib/http/analyzers/atom')
const fetch = require('../../../lib/http/fetch')

const {serveFile} = require('../../__helpers__/server')

const options = {
  userAgent: 'plunger/test',
  logger: {
    log: () => {}
  },
  timeout: {}
}

describe('http.analyzers.atom', () => {
  it('should not update token if already analyzed', async () => {
    const token = {
      analyzed: true
    }
    const save = {...token}

    const ret = await analyzeAtom(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })

  it('should not parse url body if fileType does not contain types', async () => {
    const token = {
      fileTypes: []
    }

    expect(await analyzeAtom(token)).toBeFalsy()
  })

  it('should analyze content as an atom feed', async () => {
    const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/atom.xml'))

    const token = {
      url,
      fileTypes: [
        {mime: 'application/atom+xml'}
      ]
    }

    await fetch(token, options)
    await analyzeAtom(token, options)

    expect(token.analyzed).toBeTruthy()
    expect(token.type).toBe('atom')
  })

  it('should extract children from the atom feed', async () => {
    const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/atom.xml'))

    const token = {
      url,
      fileTypes: [
        {mime: 'application/atom+xml'}
      ]
    }

    await fetch(token, options)
    await analyzeAtom(token, options)

    expect(token.children).toEqual([
      {
        inputType: 'url',
        meta: {
          author: 'Test runner',
          description: null,
          summary: null,
          title: 'File 1'
        },
        url: '/file.txt'
      },
      {
        inputType: 'url',
        meta: {
          author: 'Test runner',
          description: null,
          summary: null,
          title: 'Zip file'
        },
        url: '/file.zip'
      }
    ])
  })

  it('should support various content types', async () => {
    const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/atom-empty.xml'))

    const contentTypes = [
      'text/xml',
      'application/xml'
    ]

    await Promise.all(
      contentTypes.map(async ct => {
        const token = {
          url,
          fileTypes: [
            {mime: ct}
          ]
        }

        await fetch(token, options)
        await analyzeAtom(token, options)

        expect(token.analyzed).toBeTruthy()
        expect(token.type).toBe('atom')
        expect(token.children).toHaveLength(0)
      })
    )
  })

  it('should not extract any child for an empty atom feed', async () => {
    const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/atom-empty.xml'))

    const token = {
      url,
      fileTypes: [
        {mime: 'application/atom+xml'}
      ]
    }

    await fetch(token, options)
    await analyzeAtom(token, options)

    expect(token.analyzed).toBeTruthy()
    expect(token.type).toBe('atom')
    expect(token.children).toHaveLength(0)
  })

  it('should not analyze non atom feeds', async () => {
    const url = await serveFile(path.resolve(__dirname, '../../__fixtures__/file.txt'))

    const token = {
      url,
      fileTypes: [
        {mime: 'application/atom+xml'}
      ]
    }

    await fetch(token, options)
    await analyzeAtom(token, options)

    return expect(token.analyzed).toBeFalsy()
  })
})
