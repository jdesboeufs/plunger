const path = require('path')
const test = require('ava')
const analyzeArchive = require('../../../lib/path/analyzers/archive')
const {createTempDirectory} = require('../../../lib/util/tmpdir')
const rm = require('../../__helpers__/rm')

const options = {
  logger: {
    log: () => {}
  },
  extractArchives: true
}

test('should not update token if already analyzed', async t => {
  const token = {
    analyzed: true
  }
  const save = Object.assign({}, token)

  const ret = await analyzeArchive(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should not update token if it is not an archive', async t => {
  const token = {
    fileTypes: [
      {ext: 'txt', mime: 'text/plain'}
    ]
  }
  const save = Object.assign({}, token)

  const ret = await analyzeArchive(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should not extract archives if not specified in the options', async t => {
  const token = {
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ]
  }

  await analyzeArchive(token, {
    extractArchives: false
  })

  t.deepEqual(token, {
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    type: 'archive',
    analyzed: true
  })
})

test('should extract an archive and add a child with the extracted folder', async t => {
  const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')

  const token = {
    path: filePath,
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ]
  }

  await analyzeArchive(token, options)

  const tmp = token.temporary

  t.deepEqual(token, {
    path: filePath,
    analyzed: true,
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    children: [
      {
        filePath: undefined,
        inputType: 'path',
        path: path.join(tmp, '_unarchived'),
        fromUrl: undefined
      }
    ],
    type: 'archive',
    temporary: tmp
  })

  return rm(tmp)
})

test('should pass the filePath when specified', async t => {
  const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')

  const token = {
    path: filePath,
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    filePath: 'somepath/hello.zip/file.zip'
  }

  await analyzeArchive(token, options)

  const tmp = token.temporary

  t.deepEqual(token, {
    path: filePath,
    analyzed: true,
    filePath: 'somepath/hello.zip/file.zip',
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    children: [
      {
        filePath: 'somepath/hello.zip/file.zip',
        inputType: 'path',
        path: path.join(tmp, '_unarchived'),
        fromUrl: undefined
      }
    ],
    type: 'archive',
    temporary: tmp
  })

  return rm(tmp)
})

test('should use the fileName when filePath is not specified', async t => {
  const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')

  const token = {
    path: filePath,
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    fileName: 'file.zip'
  }

  await analyzeArchive(token, options)

  const tmp = token.temporary

  t.deepEqual(token, {
    path: filePath,
    analyzed: true,
    fileName: 'file.zip',
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    children: [
      {
        filePath: 'file.zip',
        inputType: 'path',
        path: path.join(tmp, '_unarchived'),
        fromUrl: undefined
      }
    ],
    type: 'archive',
    temporary: tmp
  })

  return rm(tmp)
})

test('should use the specified temporary path when available', async t => {
  const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')
  const tmp = await createTempDirectory()

  const token = {
    path: filePath,
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    temporary: tmp
  }

  await analyzeArchive(token, options)

  t.is(token.temporary, tmp)
  t.is(token.children[0].path.startsWith(tmp), true)

  return rm(tmp)
})

test('should not mark invalid archives as analyzed and pass a warning message', async t => {
  const filePath = path.resolve(__dirname, '../../__fixtures__/invalid-archive.zip')
  const token = {
    path: filePath,
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ]
  }

  await analyzeArchive(token, options)

  const tmp = token.temporary

  t.deepEqual(token, {
    path: filePath,
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    warning: 'Could not extract archive',
    temporary: tmp
  })

  return rm(tmp)
})

test('should pass the url down to children', async t => {
  const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')

  const token = {
    path: filePath,
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    fileName: 'file.zip',
    url: 'foo'
  }

  await analyzeArchive(token, options)

  const tmp = token.temporary

  t.deepEqual(token, {
    url: 'foo',
    path: filePath,
    analyzed: true,
    fileName: 'file.zip',
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    children: [
      {
        filePath: 'file.zip',
        inputType: 'path',
        path: path.join(tmp, '_unarchived'),
        fromUrl: 'foo'
      }
    ],
    type: 'archive',
    temporary: tmp
  })

  return rm(tmp)
})

test('should pass the fromUrl down to children', async t => {
  const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')

  const token = {
    path: filePath,
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    fileName: 'file.zip',
    fromUrl: 'foo'
  }

  await analyzeArchive(token, options)

  const tmp = token.temporary

  t.deepEqual(token, {
    fromUrl: 'foo',
    path: filePath,
    analyzed: true,
    fileName: 'file.zip',
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    children: [
      {
        filePath: 'file.zip',
        inputType: 'path',
        path: path.join(tmp, '_unarchived'),
        fromUrl: 'foo'
      }
    ],
    type: 'archive',
    temporary: tmp
  })

  return rm(tmp)
})

test('should prioritize url over fromUrl when passing them down to children', async t => {
  const filePath = path.resolve(__dirname, '../../__fixtures__/file.zip')

  const token = {
    path: filePath,
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    fileName: 'file.zip',
    url: 'foo',
    fromUrl: 'bar'
  }

  await analyzeArchive(token, options)

  const tmp = token.temporary

  t.deepEqual(token, {
    url: 'foo',
    fromUrl: 'bar',
    path: filePath,
    analyzed: true,
    fileName: 'file.zip',
    fileTypes: [
      {ext: 'zip', mime: 'application/zip'}
    ],
    children: [
      {
        filePath: 'file.zip',
        inputType: 'path',
        path: path.join(tmp, '_unarchived'),
        fromUrl: 'foo'
      }
    ],
    type: 'archive',
    temporary: tmp
  })

  return rm(tmp)
})
