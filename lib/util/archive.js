const execa = require('execa')

const {createTempDirectory} = require('./tmpdir')

async function unarchive(filePath) {
  const temp = await createTempDirectory()

  await execa('unar', ['-no-directory', '-output-directory', temp, filePath])

  return temp
}

const archiveExtensions = [
  'zip',
  'tar',
  'rar',
  'gz',
  'bz2',
  '7z',
  'xz',
  'exe'
]

function isArchive(token) {
  return token.fileTypes.some(type => archiveExtensions.includes(type.ext))
}

module.exports = {unarchive, isArchive}
