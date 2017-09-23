const test = require('ava')
const analyzeName = require('../../../lib/url/analyzers/name')

test('should not update token if already analyzed', t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = analyzeName(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should use content disposition header when available', t => {
  const token = {
    response: {
      headers: {
        'content-disposition': 'attachment; filename=foobar'
      }
    }
  }

  analyzeName(token)

  t.is(token.fileName, 'foobar')
})

test('should decode rfc2047 from content disposition header', t => {
  const token = {
    response: {
      headers: {
        'content-disposition': 'attachment; filename="=?utf-8?B?Zm9vYmFy?="'
      }
    }
  }

  analyzeName(token)

  t.is(token.fileName, 'foobar')
})

test('should use finalURL filename when content disposition is not available', t => {
  const token = {
    response: {
      headers: {}
    },
    finalURL: 'http://localhost/foobar'
  }

  analyzeName(token)

  t.is(token.fileName, 'foobar')
})

test('should not set a fileName when finalUrl does not include a file name', t => {
  const token = {
    response: {
      headers: {}
    },
    finalURL: 'http://localhost:8000'
  }

  analyzeName(token)

  t.is(token.fileName, undefined)
})

test('should use finalUrl for invalid content disposition headers', t => {
  const token = {
    response: {
      headers: {
        'content-disposition': 'asdfsdf'
      }
    },
    finalURL: 'http://localhost/foobar'
  }

  analyzeName(token)

  t.is(token.fileName, 'foobar')
})
