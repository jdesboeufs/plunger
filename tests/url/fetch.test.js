const path = require('path')
const test = require('ava')
const fetch = require('../../lib/url/fetch')

const {serveFile} = require('../__helpers__/server')

const options = {
  userAgent: 'plunger/test',
  timeout: {}
}

test('should attach a response object to the token', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

  const token = {
    url: location
  }

  await fetch(token, options)

  t.truthy(token.response)
})

test('should set the finalURL to the request', async t => {
  const location = await serveFile(path.resolve(__dirname, '../__fixtures__/file.txt'))

  const token = {
    url: location
  }

  await fetch(token, options)

  t.is(token.finalURL, location)
})
