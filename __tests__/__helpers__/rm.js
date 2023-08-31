const fs = require('node:fs')

module.exports = path => fs.promises.rm(path, {force: true, recursive: true})
