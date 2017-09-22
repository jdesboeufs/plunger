const path = require('path')
const test = require('ava')
const parsePath = require('..')

const options = {
  digestAlgorithm: 'md5',
  logger: {
    log: () => {}
  }
}

test('should not update token if already analyzed', async t => {
  const token = {
    parsed: true
  }
  const save = Object.assign({}, token)

  const ret = await parsePath(token)

  t.is(ret, false)
  t.deepEqual(token, save)
})

test('should throw if the file is not found', async t => {
  const token = {
    path: path.resolve(__dirname, 'fixtures/not-found.txt')
  }

  await t.throws(parsePath(token, options), /ENOENT: no such file or directory/)
})

test('should parse a text file completely', async t => {
  const filePath = path.resolve(__dirname, 'fixtures/file.txt')

  const token = {
    path: filePath
  }

  await parsePath(token, options)

  t.deepEqual(token, {
    digest: 'md5-c897d1410af8f2c74fba11b1db511e9e',
    fileName: 'file.txt',
    fileSize: 13,
    fileTypes: [{
      ext: 'txt',
      mime: 'text/plain',
      source: 'path:filename'
    }],
    parsed: true,
    path: filePath,
    type: 'file'
  })
})

test('should parse a directory completely', async t => {
  const filePath = path.resolve(__dirname, 'fixtures/directory')

  const token = {
    path: filePath
  }

  await parsePath(token, options)

  t.deepEqual(token, {
    children: [
      {
        filePath: '1.txt',
        inputType: 'path',
        path: path.join(filePath, '1.txt')
      },
      {
        filePath: '2.txt',
        inputType: 'path',
        path: path.join(filePath, '2.txt')
      }
    ],
    parsed: true,
    path: filePath,
    type: 'directory'
  })
})

test('should error on unknown file types (symlink)', async t => {
  const token = {
    path: path.resolve(__dirname, 'fixtures/link.txt')
  }

  await t.throws(parsePath(token, options, 'Unsupported file type'))
})

test('should remove the stats from the token on error', async t => {
  const token = {
    path: path.resolve(__dirname, 'fixtures/link.txt')
  }

  await t.throws(parsePath(token, options, 'Unsupported file type'))

  t.is(token.stats, undefined)
})
