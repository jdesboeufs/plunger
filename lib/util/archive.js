const util = require('util')
const fs = require('fs')
const path = require('path')
const execa = require('execa')

const {createTempDirectory} = require('./tmpdir')

const mkdir = util.promisify(fs.mkdir)

async function unarchive(filePath, basePath) {
  if (!basePath) {
    const tmpDirectory = await createTempDirectory()
    basePath = tmpDirectory.path
  }

  const unarchivedPath = path.join(basePath, 'unarchived')

  await mkdir(unarchivedPath)
  await execa('unar', ['-no-directory', '-output-directory', unarchivedPath, filePath])

  return unarchivedPath
}

function isArchive(token) {
  return token.fileType && [
    'zip',
    'tar',
    'rar',
    'gz',
    'bz2',
    '7z',
    'xz',
    'exe'
  ].includes(token.fileType.ext)
}

module.exports = {unarchive, isArchive}
