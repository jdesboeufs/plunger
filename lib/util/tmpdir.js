'use strict'

const {mkdtemp} = require('fs')
const {tmpdir} = require('os')
const {join} = require('path')
const {promisify} = require('util')

const mkdtempAsync = promisify(mkdtemp)

async function createTempDirectory() {
  return mkdtempAsync(join(tmpdir(), 'plunger_'))
}

module.exports = {createTempDirectory}
