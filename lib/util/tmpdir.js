'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {promisify} = require('node:util')

const mkdtemp = promisify(fs.mkdtemp)

function createTempDirectory(prefix = 'plunger_') {
  return mkdtemp(path.join(os.tmpdir(), prefix))
}

module.exports = {createTempDirectory}
