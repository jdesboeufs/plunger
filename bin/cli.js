#!/usr/bin/env node

const {inspect, promisify} = require('util')

const program = require('commander')
const updateNotifier = require('update-notifier')
const rimraf = require('rimraf')

const {analyzeLocation} = require('..')
const pkg = require('../package.json')

const rimrafAsync = promisify(rimraf)

updateNotifier({pkg}).notify()

program
  .version(pkg.version)
  .arguments('<url>')
  .option('-e, --etag [value]', 'pass an etag')
  .option('-c, --concurrency [n]', 'maximum of concurrent locations analyzed', parseInt)
  .option('--no-archives', 'ignore archives')
  .option('--no-cleanup', 'do not cleanup temporary files')
  .action(async url => {
    const tree = await analyzeLocation(url, {
      extractArchives: program.archives,
      etag: program.etag
    })

    console.log(inspect(tree, {colors: true, depth: 10}))

    if (program.cleanup) {
      await cleanup(tree)
    }
  })

async function cleanup(node) {
  if (node.temporary) {
    await rimrafAsync(node.temporary)
  }

  if (node.children) {
    await Promise.all(node.children.map(cleanup))
  }
}

program.parse(process.argv)
