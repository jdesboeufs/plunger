const {cpus} = require('os')

const defaultLogger = require('./logger')

module.exports = {
  etag: null,
  lastModified: null,
  userAgent: 'plunger/2.0 (+https://github.com/inspireteam/plunger)',
  timeout: {
    connection: 2000,
    activity: 4000,
    download: 0
  },
  maxDownloadSize: 100 * 1024 * 1024,
  digestAlgorithm: 'sha384',
  extractArchives: true,
  indexOfMatches: [
    /Directory of/,
    /Index of/,
    /Listing of/
  ],
  logger: defaultLogger,
  concurrency: cpus().length,

  cache: null
}
