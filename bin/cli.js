#!/usr/bin/env node

const {inspect} = require('util')

const {omit} = require('lodash')
const program = require('commander')
const updateNotifier = require('update-notifier')

const {analyzeURL} = require('../')
const pkg = require('../package.json')

updateNotifier({pkg}).notify()

program
  .version(pkg.version)
  .arguments('<url>')
  .action(url => {
    analyzeURL(url)
      .then(result => console.log(inspect(omit(result, 'body'), {colors: true})))
      .catch(err => {
        console.error(err)
      })
  })

program.parse(process.argv)
