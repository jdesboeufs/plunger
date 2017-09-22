const path = require('path')
const test = require('ava')
const parseFile = require('../../parsers/file')

const options = {
  digestAlgorithm: 'sha384'
}

test('should not update token if already analyzed', async t => {
  const token = {
    parsed: true
  }
  const save = Object.assign({}, token)

  const ret = await parseFile(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should compute the digest', async t => {
  const token = {
    path: path.resolve(__dirname, '../fixtures/file.txt')
  }

  await parseFile(token, options)

  t.is(
    token.digest,
    'sha384-ec8d147738b2e4bf6f5c5ac50a9a7593fb1ee2de01474d6f8a6c7fdb7ac945580772a5225a4c7251a7c0697acb7b8405'
  )
})

test('should compute with the specified algorithm', async t => {
  const token = {
    path: path.resolve(__dirname, '../fixtures/file.txt')
  }

  await parseFile(token, {
    digestAlgorithm: 'md5'
  })

  t.is(token.digest, 'md5-c897d1410af8f2c74fba11b1db511e9e')
})

test('should not override the digest', async t => {
  const token = {
    digest: 'already computed'
  }

  await parseFile(token)

  t.is(token.digest, 'already computed')
})

test('should set the fileSize when the stat object is provided', async t => {
  const token = {
    digest: 'already computed',
    stats: {size: 70}
  }

  await parseFile(token)

  t.is(token.fileSize, 70)
})

test('should not override the fileSize', async t => {
  const token = {
    digest: 'already computed',
    fileSize: 42,
    stats: {size: 70}
  }

  await parseFile(token)

  t.is(token.fileSize, 42)
})

test('should set the token type to file', async t => {
  const token = {
    digest: 'already computed'
  }

  await parseFile(token, options)

  t.is(token.type, 'file')
})

test('should set the token as parsed', async t => {
  const token = {
    digest: 'already computed'
  }

  await parseFile(token, options)

  t.is(token.parsed, true)
})
