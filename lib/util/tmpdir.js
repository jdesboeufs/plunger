'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const {promisify} = require('util')

const mkdtemp = promisify(fs.mkdtemp)

function createTempDirectory(prefix = 'plunger_') {
  return mkdtemp(path.join(os.tmpdir(), prefix))
}

module.exports = {createTempDirectory}
