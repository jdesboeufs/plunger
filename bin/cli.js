#!/usr/bin/env node

const {inspect} = require('util')

const program = require('commander')
const updateNotifier = require('update-notifier')

const {analyze, extractFiles} = require('../')
const pkg = require('../package.json')

updateNotifier({pkg}).notify()

program
  .version(pkg.version)
  .arguments('<url>')
  .option('-t, --tree', 'display tree')
  .option('-e, --etag [value]', 'pass an etag')
  .option('--no-archives', 'ignore archives')
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
      console.log(
        inspect(extractFiles(tree), {colors: true, depth: 10})
      )
    }
  })

program.parse(process.argv)
