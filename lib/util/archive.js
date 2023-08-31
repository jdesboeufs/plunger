'use strict'

const path = require('node:path')
const execa = require('execa')

async function unarchive(location, base) {
  if (!base) {
    base = path.dirname(location)
  }

  const temp = path.join(base, '_unarchived')

  try {
    await execa('unar', ['-no-directory', '-output-directory', temp, location])
  } catch {
    throw new Error('Could not extract archive')
  }

  return temp
}

const archiveExtensions = new Set([
  'zip',
  'tar',
  'rar',
  'gz',
  'bz2',
  '7z',
  'xz',
  'exe'
])

function isArchive(types) {
  return types.some(type => archiveExtensions.has(type.ext))
}

module.exports = {unarchive, isArchive}
