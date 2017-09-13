#!/usr/bin/env node

const {inspect} = require('util')

const {omit} = require('lodash')
const program = require('commander')
const updateNotifier = require('update-notifier')

const analyze = require('../')
const pkg = require('../package.json')

updateNotifier({pkg}).notify()

program
  .version(pkg.version)
  .arguments('<url>')
  .action(url => {
    analyze(url, {lastCheckedAt: null})
      .then(result => console.log(inspect(omit(result, 'body'), {colors: true, depth: 10})))
      .catch(err => {
        console.error(err)
      })
  })

program.parse(process.argv)
