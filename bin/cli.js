#!/usr/bin/env node

const {inspect, promisify} = require('util')

const program = require('commander')
const updateNotifier = require('update-notifier')
const rimraf = require('rimraf')

const {analyze, extractFiles} = require('../')
const pkg = require('../package.json')

const rimrafAsync = promisify(rimraf)

updateNotifier({pkg}).notify()

program
  .version(pkg.version)
  .arguments('<url>')
  .option('-t, --tree', 'display tree')
  .option('-e, --etag [value]', 'pass an etag')
  .option('--no-archives', 'ignore archives')
  .option('--no-cleanup', 'do not cleanup temporary files')
  .action(async url => {
    const tree = await analyze(url, {
      extractArchives: program.archives,
      etag: program.etag
    })

    if (program.tree) {
      console.log(
        inspect(tree, {colors: true, depth: 10})
      )
    } else {
      const extract = extractFiles(tree)

      console.log(
        inspect(extract, {colors: true, depth: 10})
      )

      if (program.cleanup) {
        await Promise.all(extract.temporary.map(t => rimrafAsync(t.temporary)))
      }
    }
  })

program.parse(process.argv)
