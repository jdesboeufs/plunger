const path = require('path')
const analyzeDirectory = require('../../../lib/path/analyzers/directory')

describe('path.analyzers.directory', () => {
  it('should not update token if already analyzed', async () => {
    const token = {
      analyzed: true
    }
    const save = Object.assign({}, token)

    const ret = await analyzeDirectory(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })

  it('should return a child for each item in the directory', async () => {
    const token = {
      path: path.resolve(__dirname, '../../__fixtures__/directory')
    }

    await analyzeDirectory(token)

    expect(token.children).toEqual([
      {
        filePath: '1.txt',
        inputType: 'path',
        path: path.join(token.path, '1.txt'),
        fromUrl: undefined
      },
      {
        filePath: '2.txt',
        inputType: 'path',
        path: path.join(token.path, '2.txt'),
        fromUrl: undefined
      }
    ])
  })

  it('should set the token type to directory', async () => {
    const token = {
      path: path.resolve(__dirname, '../../__fixtures__/directory')
    }

    await analyzeDirectory(token)

    expect(token.type).toBe('directory')
  })

  it('should set the token as analyzed', async () => {
    const token = {
      path: path.resolve(__dirname, '../../__fixtures__/directory')
    }

    await analyzeDirectory(token)

    expect(token.analyzed).toBeTruthy()
  })

  it('should pass the fromUrl attribute down to children', async () => {
    const token = {
      path: path.resolve(__dirname, '../../__fixtures__/directory'),
      fromUrl: 'foo'
    }

    await analyzeDirectory(token)

    expect(token.children).toEqual([
      {
        filePath: '1.txt',
        inputType: 'path',
        path: path.join(token.path, '1.txt'),
        fromUrl: 'foo'
      },
      {
        filePath: '2.txt',
        inputType: 'path',
        path: path.join(token.path, '2.txt'),
        fromUrl: 'foo'
      }
    ])
  })
})
