const os = require('os')
const path = require('path')
const test = require('ava')
const tmpdir = require('../../lib/util/tmpdir')
const rm = require('../__helpers__/rm')

const ostmpdir = os.tmpdir()

test('should create a tmp directory prefixed with plunger_', async t => {
  const tmp = await tmpdir.createTempDirectory()

  t.is(tmp.startsWith(path.join(ostmpdir, 'plunger_')), true)
  t.context.dir = tmp
})

test('should change the prefix when specified', async t => {
  const tmp = await tmpdir.createTempDirectory('hello')

  t.is(tmp.startsWith(path.join(ostmpdir, 'hello')), true)
  t.context.dir = tmp
})

test.afterEach(t => {
  rm(t.context.dir)
})
