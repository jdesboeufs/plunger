const path = require('path')
const test = require('ava')
const analyzeFile = require('../../analyzers/file')

const options = {
  digestAlgorithm: 'sha384'
}

test('should not update token if already analyzed', async t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = await analyzeFile(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should compute the digest', async t => {
  const token = {
    path: path.resolve(__dirname, '../fixtures/file.txt')
  }

  await analyzeFile(token, options)

  t.is(token.digest, 'sha384-7I0Udziy5L9vXFrFCpp1k/se4t4BR01vimx/23rJRVgHcqUiWkxyUafAaXrLe4QF')
})

test('should compute with the specified algorithm', async t => {
  const token = {
    path: path.resolve(__dirname, '../fixtures/file.txt')
  }

  await analyzeFile(token, {
    digestAlgorithm: 'md5'
  })

  t.is(token.digest, 'md5-yJfRQQr48sdPuhGx21Eeng==')
})

test('should not override the digest', async t => {
  const token = {
    digest: 'already computed'
  }

  await analyzeFile(token)

  t.is(token.digest, 'already computed')
})

test('should set the fileSize when the stat object is provided', async t => {
  const token = {
    digest: 'already computed',
    stats: {size: 70}
  }

  await analyzeFile(token)

  t.is(token.fileSize, 70)
})

test('should not override the fileSize', async t => {
  const token = {
    digest: 'already computed',
    fileSize: 42,
    stats: {size: 70}
  }

  await analyzeFile(token)

  t.is(token.fileSize, 42)
})

test('should set the token type to file', async t => {
  const token = {
    digest: 'already computed'
  }

  await analyzeFile(token, options)

  t.is(token.type, 'file')
})

test('should set the token as analyzed', async t => {
  const token = {
    digest: 'already computed'
  }

  await analyzeFile(token, options)

  t.is(token.analyzed, true)
})
