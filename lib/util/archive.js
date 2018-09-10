'use strict'

const path = require('path')
const execa = require('execa')

async function unarchive(location, base) {
  if (!base) {
    base = path.dirname(location)
  }

  const temp = path.join(base, '_unarchived')

  try {
    await execa('unar', ['-no-directory', '-output-directory', temp, location])
  } catch (error) {
    throw new Error('Could not extract archive')
  }

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

function isArchive(types) {
  return types.some(type => archiveExtensions.includes(type.ext))
}

module.exports = {unarchive, isArchive}
