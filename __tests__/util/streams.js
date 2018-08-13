const {bytesLimit, computeDigest} = require('../../lib/util/streams')

describe('util.streams', () => {
  it('computeDigest should throw if onDigest is not defined', () => {
    expect(() => {
      computeDigest('sha1')
    }).toThrow('onDigest is required')
  })

  it('computeDigest should throw if the algorithm is unknown', () => {
    expect(() => {
      computeDigest('lol', () => {})
    }).toThrow('Digest method not supported')
  })

  it('computeDigest should compute a hash of the stream data', done => {
    expect.assertions(2)

    let digest
    let bodyLength

    const digester = computeDigest('md5', result => {
      ({digest, bodyLength} = result)
    })

    digester.on('finish', () => {
      expect(digest).toBe('md5-yJfRQQr48sdPuhGx21Eeng==')
      expect(bodyLength).toBe(13)

      done()
    })

    digester.end('hello world!\n')
  })

  it('computeDigest should return a digest using the passed algorithm', done => {
    expect.assertions(1)

    let digest

    const digester = computeDigest('sha384', result => {
      ({digest} = result)
    })

    digester.on('finish', () => {
      expect(digest).toBe('sha384-7I0Udziy5L9vXFrFCpp1k/se4t4BR01vimx/23rJRVgHcqUiWkxyUafAaXrLe4QF')

      done()
    })

    digester.end('hello world!\n')
  })

  it('bytesLimit should throw if limit is not defined', () => {
    expect(() => {
      bytesLimit()
    }).toThrow('limit must be a positive integer')
  })

  it('bytesLimit should throw if limit is not a positive integer', () => {
    expect(() => {
      bytesLimit(-2)
    }).toThrow('limit must be a positive integer')
  })

  it('bytesLimit should not do anything if the byte limit is not reached', done => {
    const limiter = bytesLimit(42)

    limiter.on('finish', () => {
      done()
    })

    limiter.end('hello world!\n')
  })

  it('bytesLimit should error if the byte limit is reached', done => {
    expect.assertions(1)

    const limiter = bytesLimit(10)

    limiter.on('error', err => {
      expect(err.message).toBe('Content limit reached (13 > 10)')
      done()
    })

    limiter.end('hello world!\n')
  })
})
