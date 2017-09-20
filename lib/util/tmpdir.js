'use strict'

const {mkdtemp} = require('fs')
const {tmpdir} = require('os')
const {join} = require('path')
const {promisify} = require('util')
const rimraf = require('rimraf')

const rimrafAsync = promisify(rimraf)
const mkdtempAsync = promisify(mkdtemp)

async function createTempDirectory() {
  const dirPath = await mkdtempAsync(join(tmpdir(), 'plunger_'))
  return {
    path: dirPath,
    clean: () => rimrafAsync(dirPath)
  }
}

module.exports = {createTempDirectory}
