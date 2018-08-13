const analyzeFile = require('../../../lib/http/analyzers/file')

describe('http.analyzers.file', () => {
  it('should not update token if already analyzed', async () => {
    const token = {
      analyzed: true
    }
    const save = Object.assign({}, token)

    const ret = await analyzeFile(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })
})
