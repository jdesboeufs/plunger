const analyzeName = require('../../../lib/path/analyzers/name')

describe('path.analyzers.name', () => {
  it('should not update token if already analyzed', () => {
    const token = {
      analyzed: true
    }
    const save = Object.assign({}, token)

    const ret = analyzeName(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })

  it('should use the basename of the path to set the fileName', () => {
    const token = {
      path: '/path/to/some/random/file.zip'
    }

    analyzeName(token)

    expect(token.fileName).toBe('file.zip')
  })
})
