const analyzeFile = require('../../../lib/path/analyzers/file')

describe('path.analyzers.file', () => {
  it('should not update token if already analyzed', async () => {
    const token = {
      analyzed: true
    }
    const save = Object.assign({}, token)

    const ret = await analyzeFile(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })

  it('should set the token type to file', async () => {
    const token = {
      digest: 'already computed'
    }

    await analyzeFile(token)

    expect(token.type).toBe('file')
  })

  it('should set the token as analyzed', async () => {
    const token = {}

    await analyzeFile(token)

    expect(token.analyzed).toBeTruthy()
  })
})
