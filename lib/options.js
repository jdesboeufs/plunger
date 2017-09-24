const defaultLogger = require('./logger')

const analyze = {
  etag: null,
  lastCheckedAt: null,
  userAgent: 'plunger/1.0',
  timeout: {
    connection: 2000,
    download: 20000
  },
  digestAlgorithm: 'sha384',
  extractArchives: true,
  indexOfMatches: [
    /Directory of/,
    /Index of/,
    /Listing of/
  ],
  logger: defaultLogger
}

const extract = {
  keepUnknownTypes: true,
  types: [
    {
      extensions: ['gpkg'],
      type: 'geopackage',
      format: 'mixed'
    },
    {
      extensions: ['shp'],
      type: 'shapefile',
      format: 'vector',
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
      format: 'vector',
      related: ['mid']
    },
    {
      extensions: ['tab'],
      type: 'tab',
      format: 'vector',
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
      type: 'image',
      format: 'raster'
    }
  ]
}

module.exports = {analyze, extract}
