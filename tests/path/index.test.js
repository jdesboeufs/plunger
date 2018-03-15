const path = require('path')
const test = require('ava')
const analyzePath = require('../../lib/path')
const rm = require('../__helpers__/rm')

const options = {
  digestAlgorithm: 'md5',
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

  const ret = await analyzePath(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should throw if the file is not found', async t => {
  const token = {
    path: path.resolve(__dirname, '../__fixtures__/not-found.txt')
  }

  await t.throws(analyzePath(token, options), /ENOENT: no such file or directory/)
})

test('should analyze a text file completely', async t => {
  const filePath = path.resolve(__dirname, '../__fixtures__/file.txt')

  const token = {
    path: filePath
  }

  await analyzePath(token, options)

  t.deepEqual(token, {
    digest: 'md5-yJfRQQr48sdPuhGx21Eeng==',
    fileName: 'file.txt',
    fileSize: 13,
    fileTypes: [{
      ext: 'txt',
      mime: 'text/plain',
      source: 'path:filename'
    }],
    analyzed: true,
    path: filePath,
    type: 'file'
  })
})

test('should analyze a directory completely', async t => {
  const filePath = path.resolve(__dirname, '../__fixtures__/directory')

  const token = {
    path: filePath
  }

  await analyzePath(token, options)

  t.deepEqual(token, {
    children: [
      {
        filePath: '1.txt',
        inputType: 'path',
        path: path.join(filePath, '1.txt'),
        fromUrl: undefined
      },
      {
        filePath: '2.txt',
        inputType: 'path',
        path: path.join(filePath, '2.txt'),
        fromUrl: undefined
      }
    ],
    analyzed: true,
    path: filePath,
    type: 'directory'
  })
})

test('should analyze an archive completely', async t => {
  const filePath = path.resolve(__dirname, '../__fixtures__/file.zip')

  const token = {
    path: filePath
  }

  await analyzePath(token, options)

  const tmp = token.temporary

  t.deepEqual(token, {
    children: [
      {
        inputType: 'path',
        filePath: 'file.zip',
        path: path.join(tmp, '_unarchived'),
        fromUrl: undefined
      }
    ],
    analyzed: true,
    digest: 'md5-h6u6eX7aEtGSOMTyE5yQRQ==',
    path: filePath,
    fileTypes: [
      {
        ext: 'zip',
        mime: 'application/zip',
        source: 'path:chunk'
      },
      {
        ext: 'zip',
        mime: 'application/zip',
        source: 'path:filename'
      }
    ],
    temporary: tmp,
    fileName: 'file.zip',
    fileSize: 179,
    type: 'archive'
  })

  return rm(tmp)
})

test('should analyze an invalid archive completely', async t => {
  const filePath = path.resolve(__dirname, '../__fixtures__/invalid-archive.zip')

  const token = {
    path: filePath
  }

  await analyzePath(token, options)

  const tmp = token.temporary

  t.deepEqual(token, {
    analyzed: true,
    path: filePath,
    digest: 'md5-oPAAyc9Y+DIU9H20eZGHqA==',
    fileTypes: [
      {
        ext: 'zip',
        mime: 'application/zip',
        source: 'path:filename'
      }
    ],
    temporary: tmp,
    fileName: 'invalid-archive.zip',
    fileSize: 23,
    type: 'file',
    warning: 'Could not extract archive'
  })

  return rm(tmp)
})

test('should error on unknown file types (symlink)', async t => {
  const token = {
    path: path.resolve(__dirname, '../__fixtures__/link.txt')
  }

  await t.throws(analyzePath(token, options, 'Unsupported file type'))
})

test('should remove the stats from the token on error', async t => {
  const token = {
    path: path.resolve(__dirname, '../__fixtures__/link.txt')
  }

  await t.throws(analyzePath(token, options, 'Unsupported file type'))

  t.is(token.stats, undefined)
})

test('should mark the file as unchanged if the cache is matched', async t => {
  const token = {
    path: path.resolve(__dirname, '../__fixtures__/file.txt')
  }

  await analyzePath(token, {
    ...options,
    cache: {
      getFileCache: () => true
    }
  })

  t.true(token.unchanged)
  t.true(token.analyzed)
})
