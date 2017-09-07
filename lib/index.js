'use strict'

const {promisify} = require('util')
const {extname, join} = require('path')
const {createWriteStream, mkdir} = require('fs')
const url = require('url')
const execa = require('execa')
const hasha = require('hasha')
const getStream = require('get-stream')
const {get, omit, pick} = require('lodash')
const contentDisposition = require('content-disposition')
const contentType = require('content-type')
const whichType = require('file-type')
const {is} = require('type-is')
const {extension} = require('mime-types')
const {pipe} = require('mississippi')
const debug = require('debug')('plunger')

const request = require('./util/request')
const {bytesLimit, computeDigest} = require('./util/streams')
const {createTempDirectory} = require('./util/tmpdir')

const {analyzeLocation} = require('./directory')

const mkdirAsync = promisify(mkdir)
const firstChunkTimeout = 10000

async function analyzeURL(location) {
  debug('fetching %s', location)
  const response = await request(location)
  const {finalURL, statusCode, redirectURLs} = response
  debug('responded with status %d', statusCode)
  if (redirectURLs.length > 0) {
    debug('redirected %d times: %s', redirectURLs.length, redirectURLs.join(', '))
  }

  const result = {
    headers: extractHeaders(response),
    statusCode,
    redirectURLs,
    originalURL: location,
    finalURL
  }

  if (statusCode === 304) {
    result.type = 'not-modified'
    response.destroy()
    return result
  }

  if (statusCode !== 200) {
    result.type = 'error'
    response.destroy()
    return result
  }

  if (!response.body) {
    result.type = 'no-body'
    response.destroy()
    return result
  }

  result.contentType = extractContentType(response)
  result.contentDisposition = extractContentDisposition(response)

  const fileNameInURL = getFileNameFromLocation(finalURL)
  const fileNameInHeaders = get(result.contentDisposition, 'parameters.filename')

  result.fileName = fileNameInHeaders || fileNameInURL
  result.fileExtension = getExtension(result.fileName)

  if (isXML(response)) {
    result.type = 'xml'
    await attachBody(result, response, 'sha384')
    return result
  }

  if (isHTML(response)) {
    result.type = 'html'
    await attachBody(result, response, 'sha384')
    return result
  }

  if (isPlainText(response)) {
    result.type = 'text'
    await attachBody(result, response, 'sha384')
    return result
  }

  if (isJSON(response)) {
    result.type = 'json'
    await attachBody(result, response, 'sha384')
    return result
  }

  result.fileType = await detectFileType(response)

  if (isArchive(result.fileType)) {
    let tmpDirectory
    try {
      result.type = 'archive'
      result.archiveType = result.fileType.ext
      tmpDirectory = await createTempDirectory()
      const filePath = join(tmpDirectory.path, result.fileName)
      const {digest} = await downloadFile(filePath, response.body)
      result.filePath = filePath
      result.tmpDirectory = tmpDirectory.path
      result.digest = digest
      const unarchivedPath = join(tmpDirectory.path, 'unarchived')
      await extractArchive(filePath, unarchivedPath)
      debug('analyzing directory tree')
      result.files = await analyzeLocation(unarchivedPath)
      debug('directory tree analyzed')
    } catch (err) {
      result.checkError = err.message
      response.destroy()
    } finally {
      // tmpDirectory.clean().catch(console.error)
    }
    return result
  }

  // THEN?

  result.type = 'unknown'
  response.destroy()
  return result
}

/* Helpers */

function extractHeaders(response) {
  return omit(response.headers, 'set-cookie', 'connection')
}

function extractContentDisposition(response) {
  const headerValue = response.headers['content-disposition']
  if (!headerValue) return {}
  return contentDisposition.parse(headerValue)
}

function extractContentType(response) {
  const headerValue = response.headers['content-type']
  if (!headerValue) return {}
  const parsedValue = pick(contentType.parse(headerValue), 'type', 'parameters')
  if (parsedValue.type) parsedValue.ext = extension(parsedValue.type)
  return parsedValue
}

function getFileNameFromLocation(location) {
  const {pathname} = url.parse(location)

  if (!pathname) {
    return null
  }

  return pathname
    .split('/')
    .pop()
    .split('#')[0]
    .split('?')[0] || null
}

function getExtension(fileName) {
  if (!fileName) return null
  return extname(fileName).substr(1).toLowerCase()
}

async function detectFileType(response) {
  const firstChunk = await getFirstChunk(response)
  return whichType(firstChunk) || {}
}

function isHTML(response) {
  return is(response, ['html'])
}

function isJSON(response) {
  return is(response, ['json'])
}

function isXML(response) {
  return is(response, ['xml'])
}

function isPlainText(response) {
  return response.headers['content-type'] === 'text/plain'
}

// function isBinary(response) {
//   return [
//     'application/octet-stream',
//     'application/binary',
//   ].includes(response.headers['content-type'])
// }

function isArchive(fileType) {
  if (!fileType) {
    throw new Error('fileType is required')
  }
  return [
    'zip',
    'tar',
    'rar',
    'gz',
    'bz2',
    '7z',
    'xz',
    'exe'
  ].includes(fileType.ext)
}

function getFirstChunk(response) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Timeout when trying to get first chunk')),
      firstChunkTimeout
    )
    response.body.once('data', firstChunk => {
      response.body.pause()
      clearTimeout(timeout)
      response.body.unshift(firstChunk)
      resolve(firstChunk)
    })
  })
}

function getDigestString(digest, algorithm = 'sha384') {
  if (!digest) return ''
  return `${algorithm}-${digest}`
}

async function attachBody(result, response, digestAlgorithm = 'sha384') {
  debug('downloading body')
  const buffer = await getStream.buffer(response.body)
  debug('body downloaded')
  result.body = buffer.toString('utf8')
  result.bodyLength = buffer.length
  debug('computing digest')
  const digest = hasha(buffer, {algorithm: digestAlgorithm})
  debug('digest computed')
  result.digest = getDigestString(digest, digestAlgorithm)
}

function downloadFile(path, body) {
  debug('downloading file (w/ on-the-fly digest computation)')
  return new Promise((resolve, reject) => {
    let digest
    let fileSize

    const onDigest = result => {
      digest = getDigestString(result.digest, 'sha384')
      fileSize = result.bodyLength
    }

    pipe(
      body,
      computeDigest('sha384', onDigest),
      bytesLimit(100 * 1024 * 1024),
      createWriteStream(path),
      err => {
        if (err) return reject(err)
        debug('file downloaded')
        resolve({digest, fileSize})
      }
    )
  })
}

async function extractArchive(archivePath, extractPath) {
  await mkdirAsync(extractPath)
  debug('extracting archive')
  await execa('unar', ['-no-directory', '-output-directory', extractPath, archivePath])
  debug('archive extracted')
}

module.exports = {analyzeURL}
