const fs = require('fs')

module.exports = path => fs.promises.rm(path, {force: true, recursive: true})
