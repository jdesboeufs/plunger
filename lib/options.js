const {cpus} = require('os')
const defaultLogger = require('./logger')

const analyze = {
  etag: null,
  lastCheckedAt: null,
  userAgent: 'plunger/1.0',
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
  concurrency: cpus().length
}

const extract = {
  keepUnknownTypes: true,
  types: [
    {
      extensions: ['gpkg'],
      type: 'geopackage'
    },
    {
      extensions: ['shp'],
      type: 'shapefile',
      related: ['shx', 'dbf', 'prj', 'sbn', 'sbx', 'fbn', 'fbx', 'ain', 'aih', 'shp.xml', 'atx', 'qix', 'cpg', 'qpj']
    },
    {
      extensions: ['dbf'],
      type: 'table',
      related: ['cpg']
    },
    {
      extensions: ['mif'],
      type: 'mif',
      related: ['mid']
    },
    {
      extensions: ['tab'],
      type: 'tab',
      related: ['dat', 'map', 'id', 'ind']
    },
    {
      extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'rtf', 'txt'],
      type: 'document'
    },
    {
      extensions: ['csv', 'tsv'],
      type: 'table'
    },
    {
      extensions: ['ecw', 'tiff', 'jp2'],
      type: 'image'
    }
  ]
}

module.exports = {analyze, extract}
