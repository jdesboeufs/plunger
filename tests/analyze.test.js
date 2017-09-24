const path = require('path')
const test = require('ava')
const analyze = require('../lib/analyze')

const options = {
  logger: {
    log: () => {}
  },
  extractArchives: true,
  digestAlgorithm: 'sha384'
}

test('should analyze a text file completely', async t => {
  const filePath = path.resolve(__dirname, '__fixtures__/file.txt')
  const token = {
    inputType: 'path',
    path: filePath
  }

  await analyze(token, options)

  t.deepEqual(token, {
    inputType: 'path',
    path: filePath,
    fileName: 'file.txt',
    fileTypes: [
      {ext: 'txt', mime: 'text/plain', source: 'path:filename'}
    ],
    type: 'file',
    digest: 'sha384-7I0Udziy5L9vXFrFCpp1k/se4t4BR01vimx/23rJRVgHcqUiWkxyUafAaXrLe4QF',
    fileSize: 13,
    analyzed: true
  })
})

test('should analyze an invalid path completely', async t => {
  const filePath = path.resolve(__dirname, '__fixtures__/not-found')
  const token = {
    inputType: 'path',
    path: filePath
  }

  await analyze(token, options)

  const error = token.error

  t.deepEqual(token, {
    inputType: 'path',
    path: filePath,
    error,
    analyzed: true
  })
})

test('should analyze a directory completely', async t => {
  const filePath = path.resolve(__dirname, '__fixtures__/directory')
  const token = {
    inputType: 'path',
    path: filePath
  }

  await analyze(token, options)

  t.deepEqual(token, {
    inputType: 'path',
    path: filePath,
    type: 'directory',
    children: [
      {
        inputType: 'path',
        path: path.join(filePath, '1.txt'),
        filePath: '1.txt',
        fileName: '1.txt',
        fileTypes: [{
          ext: 'txt',
          mime: 'text/plain',
          source: 'path:filename'
        }],
        type: 'file',
        digest: 'sha384-HQ8oTv4+3qS5yjvVFPoTSxfq42HMx6Hu/v+AG5vWYE4B8h9r8knvAwWZ8MIY8rqM',
        fileSize: 6,
        analyzed: true
      },
      {
        inputType: 'path',
        path: path.join(filePath, '2.txt'),
        filePath: '2.txt',
        fileName: '2.txt',
        fileTypes: [{
          ext: 'txt',
          mime: 'text/plain',
          source: 'path:filename'
        }],
        type: 'file',
        digest: 'sha384-vRZf1IRKUdDeUJ1lNsqndj+oIGoocD7v8XQWfhfKVmtm0CbNoclCeoWCCUs0fKpy',
        fileSize: 7,
        analyzed: true
      }
    ],
    analyzed: true
  })
})

test('should error if the inputType is not known', t => {
  const token = {inputType: 'unknown'}

  return t.throws(analyze(token, options), 'Token with inputType unknown was not analyzed')
})
