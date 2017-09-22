'use strict'

const debug = require('debug')('plunger')
const chalk = require('chalk')

function log(event, token) {
  let prefix = `[${chalk.cyan(event)}] ${chalk.yellow(token.inputType)}`

  if (token.url) {
    prefix += ` ${token.url}`
  }

  if (token.path) {
    prefix += chalk.gray(` ${token.path}`)
  }

  if (token.error) {
    debug(`${prefix} – ${chalk.red(token.error)}`)
  } else {
    debug(prefix)
  }
}

module.exports = {log}
