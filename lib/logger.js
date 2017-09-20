'use strict'

const debug = require('debug')('plunger')
const chalk = require('chalk')

function log(event, token) {
  const prefix = `[${chalk.cyan(event)}] ${token.location}`

  if (token.error) {
    debug(`${prefix} – ${chalk.red(token.error)}`)
  } else {
    debug(prefix)
  }
}

module.exports = {log}
