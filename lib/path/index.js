'use strict'

const fs = require('fs')
const util = require('util')
const hasha = require('hasha')

const analyzeDirectory = require('./analyzers/directory')
const analyzeName = require('./analyzers/name')
const analyzeTypes = require('./analyzers/types')
const analyzeArchive = require('./analyzers/archive')
const analyzeFile = require('./analyzers/file')

const lstat = util.promisify(fs.lstat)

async function computeDigest(token, options) {
  const digest = await hasha.fromStream(fs.createReadStream(token.path), {
    algorithm: options.digestAlgorithm,
    encoding: 'base64'
  })
  token.digest = `${options.digestAlgorithm}-${digest}`
}

async function analyzePath(token, options) {
  if (token.analyzed) {
    return false
  }

  options.logger.log('path:analyze:start', token)

  token.stats = await lstat(token.path)

  try {
    if (token.stats.isDirectory()) {
      await analyzeDirectory(token, options)
    } else if (token.stats.isFile()) {
      analyzeName(token, options)
      await analyzeTypes(token, options)

      if (!token.digest) {
        await computeDigest(token, options)
      }

      token.fileSize = token.stats.size

      if (options.cache && options.cache.getFileCache && await options.cache.getFileCache(token, options)) {
        token.type = 'file'
        token.unchanged = true
        token.analyzed = true
      }

      await analyzeArchive(token, options)
      await analyzeFile(token, options)
    } else {
      throw new Error('Unsupported file type')
    }
  } catch (error) {
    throw error
  } finally {
    delete token.stats
  }

  options.logger.log('path:analyze:end', token)
}

module.exports = analyzePath
