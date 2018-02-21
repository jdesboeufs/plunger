const test = require('ava')
const {bytesLimit, computeDigest} = require('../../lib/util/streams')

test('computeDigest should throw if onDigest is not defined', t => {
  t.throws(() => {
    computeDigest('sha1')
  }, 'onDigest is required')
})

test('computeDigest should throw if the algorithm is unknown', t => {
  t.throws(() => {
    computeDigest('lol', () => {})
  }, 'Digest method not supported')
})

test.cb('computeDigest should compute a hash of the stream data', t => {
  let digest
  let bodyLength

  const digester = computeDigest('md5', result => {
    ({digest, bodyLength} = result)
  })

  digester.on('error', t.ifError)
  digester.on('finish', () => {
    t.is(digest, 'md5-yJfRQQr48sdPuhGx21Eeng==')
    t.is(bodyLength, 13)

    t.end()
  })

  digester.end('hello world!\n')
})

test.cb('computeDigest should return a digest using the passed algorithm', t => {
  let digest

  const digester = computeDigest('sha384', result => {
    ({digest} = result)
  })

  digester.on('error', t.ifError)
  digester.on('finish', () => {
    t.is(digest, 'sha384-7I0Udziy5L9vXFrFCpp1k/se4t4BR01vimx/23rJRVgHcqUiWkxyUafAaXrLe4QF')

    t.end()
  })

  digester.end('hello world!\n')
})

test('bytesLimit should throw if limit is not defined', t => {
  t.throws(() => {
    bytesLimit()
  }, 'limit must be a positive integer')
})

test('bytesLimit should throw if limit is not a positive integer', t => {
  t.throws(() => {
    bytesLimit(-2)
  }, 'limit must be a positive integer')
})

test.cb('bytesLimit should not do anything if the byte limit is not reached', t => {
  const limiter = bytesLimit(42)

  limiter.on('error', t.ifError)
  limiter.on('finish', () => {
    t.end()
  })

  limiter.end('hello world!\n')
})

test.cb('bytesLimit should error if the byte limit is reached', t => {
  const limiter = bytesLimit(10)

  limiter.on('error', err => {
    t.is(err.message, 'Content limit reached (13 > 10)')
    t.end()
  })

  limiter.end('hello world!\n')
})
