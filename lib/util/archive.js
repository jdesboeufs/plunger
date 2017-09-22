const path = require('path')
const execa = require('execa')

async function unarchive(location) {
  const temp = path.join(path.dirname(location), '_unarchived')

  await execa('unar', ['-no-directory', '-output-directory', temp, location])

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
