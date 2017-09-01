const {promisify} = require('util')
const {stat, readdir} = require('fs')
const {relative} = require('path')
const {sortBy, omit} = require('lodash')

const statAsync = promisify(stat)
const readdirAsync = promisify(readdir)

const FILE_TYPES_PATTERNS = [
  {extensions: ['gpkg'], type: 'mixed', format: 'gpkg'},
  {extensions: ['shp'], type: 'vector', format: 'shp', related: ['shx', 'dbf', 'prj', 'sbn', 'sbx', 'fbn', 'fbx', 'ain', 'aih', 'shp.xml', 'atx', 'qix']},
  {extensions: ['mif'], type: 'vector', format: 'mif', related: ['mid']},
  {extensions: ['tab'], type: 'vector', format: 'tab', related: ['dat', 'map', 'id', 'ind']},
  {extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'rtf', 'txt'], type: 'document'},
  {extensions: ['csv', 'tsv', 'dbf'], type: 'table'},
  {extensions: ['ecw', 'tiff', 'jp2'], type: 'raster'}
]

function getTypeFromStats(stats) {
  if (stats.isDirectory()) return 'directory'
  if (stats.isFile()) return 'file'
  throw new Error('Not supported path type')
}

function matchExtension(path, extension) {
  return path.toLowerCase().endsWith('.' + extension)
}

function detectFormats(paths) {
  const files = paths.filter(path => path.type === 'file')

  FILE_TYPES_PATTERNS.forEach(pattern => {
    files.forEach(file => {
      if (file.format || file.related) return

      const matchingExtension = pattern.extensions.find(extension => matchExtension(file.path, extension))
      if (!matchingExtension) return

      file.formatType = pattern.type
      file.format = pattern.format || matchingExtension
      file.extension = matchingExtension

      if (pattern.related) {
        const prefix = file.path.substr(0, file.path.length - matchingExtension.length - 1)
        files.forEach(candidateRelatedFile => {
          if (!candidateRelatedFile.path.startsWith(prefix)) return
          pattern.related.forEach(relatedExtension => {
            const match = matchExtension(candidateRelatedFile.path, relatedExtension)
            const lengthIsValid = candidateRelatedFile.path.length === prefix.length + relatedExtension.length + 1

            if (match && lengthIsValid) {
              candidateRelatedFile.related = file.path
            }
          })
        })
      }
    })
  })

  return paths
}

async function analyzeDirectory(location) {
  const paths = await readdirAsync(location)

  const preAnalyzedPaths = await Promise.all(paths.map(async path => {
    const fullpath = location + '/' + path
    const stats = await statAsync(fullpath)
    const type = getTypeFromStats(stats)

    if (type === 'directory') {
      return {
        path,
        fullpath,
        type,
        stats,
        children: await analyzeDirectory(fullpath)
      }
    }

    // if (path.toLowerCase().endsWith('.md5')) return

    return {path, fullpath, type, stats}
  }))

  return detectFormats(preAnalyzedPaths)
}

async function analyzeLocation(location) {
  const stats = await statAsync(location)
  if (!stats.isDirectory()) {
    throw new Error('Given location must be a directory')
  }
  const tree = await analyzeDirectory(location)
  return sortBy(extractFiles(tree).map(file => {
    const newFile = omit(file, 'path', 'fullpath', 'type')
    newFile.name = file.path
    newFile.path = relative(location, file.fullpath)
    return newFile
  }), file => file.path.toLowerCase())
}

/* Formatting */

function extractFiles(nodes = []) {
  let files = []
  nodes.forEach(node => {
    if (node.type === 'file') {
      files.push(node)
    } else {
      files = files.concat(extractFiles(node.children))
    }
  })
  return files
}

module.exports = {
  analyzeDirectory,
  analyzeLocation,
  getTypeFromStats,
  detectFormats,
  matchExtension
}
