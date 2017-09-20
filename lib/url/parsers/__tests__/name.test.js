const test = require('ava')
const parseName = require('../name')

test('should not update token if already analyzed', t => {
  const token = {
    parsed: true
  }
  const save = Object.assign({}, token)

  const ret = parseName(token)

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

  parseName(token)

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

  parseName(token)

  t.is(token.fileName, 'foobar')
})

test('should use finalURL filename when content disposition is not available', t => {
  const token = {
    response: {
      headers: {}
    },
    finalURL: 'http://localhost/foobar'
  }

  parseName(token)

  t.is(token.fileName, 'foobar')
})

test('should not set a fileName when finalUrl does not include a file name', t => {
  const token = {
    response: {
      headers: {}
    },
    finalURL: 'http://localhost:8000'
  }

  parseName(token)

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

  parseName(token)

  t.is(token.fileName, 'foobar')
})
