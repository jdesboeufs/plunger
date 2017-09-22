const path = require('path')
const test = require('ava')
const parseFile = require('../file')

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
    path: path.resolve(__dirname, 'fixtures/file.txt')
  }

  await parseFile(token, options)

  t.is(
    token.digest,
    'sha384-1d0f284efe3edea4b9ca3bd514fa134b17eae361ccc7a1eefeff801b9bd6604e01f21f6bf249ef030599f0c218f2ba8c'
  )
})

test('should compute with the specified algorithm', async t => {
  const token = {
    path: path.resolve(__dirname, 'fixtures/file.txt')
  }

  await parseFile(token, {
    digestAlgorithm: 'md5'
  })

  t.is(token.digest, 'md5-b1946ac92492d2347c6235b4d2611184')
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
