const analyzeName = require('../../../lib/http/analyzers/name')

describe('http.analyzers.name', () => {
  it('should not update token if already analyzed', () => {
    const token = {
      analyzed: true
    }
    const save = Object.assign({}, token)

    const ret = analyzeName(token)

    expect(ret).toBeFalsy()
    expect(token).toEqual(save)
  })

  it('should use content disposition header when available', () => {
    const token = {
      response: {
        headers: {
          'content-disposition': 'attachment; filename=foobar'
        }
      }
    }

    analyzeName(token)

    expect(token.fileName).toBe('foobar')
  })

  it('should decode rfc2047 from content disposition header', () => {
    const token = {
      response: {
        headers: {
          'content-disposition': 'attachment; filename="=?utf-8?B?Zm9vYmFy?="'
        }
      }
    }

    analyzeName(token)

    expect(token.fileName).toBe('foobar')
  })

  it('should use finalUrl filename when content disposition is not available', () => {
    const token = {
      response: {
        headers: {}
      },
      finalUrl: 'http://localhost/foobar'
    }

    analyzeName(token)

    expect(token.fileName).toBe('foobar')
  })

  it('should decode filenames coming from URLs', () => {
    const token = {
      response: {
        headers: {}
      },
      finalUrl: 'http://localhost/foo%20bar'
    }

    analyzeName(token)

    expect(token.fileName).toBe('foo bar')
  })

  it('should not set a fileName when finalUrl does not include a file name', () => {
    const token = {
      response: {
        headers: {}
      },
      finalUrl: 'http://localhost:8000'
    }

    analyzeName(token)

    expect(token.fileName).toBeUndefined()
  })

  it('should use finalUrl for invalid content disposition headers', () => {
    const token = {
      response: {
        headers: {
          'content-disposition': 'asdfsdf'
        }
      },
      finalUrl: 'http://localhost/foobar'
    }

    analyzeName(token)

    expect(token.fileName).toBe('foobar')
  })
})
