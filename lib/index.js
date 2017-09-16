'use strict'

const url = require('url')
const parse = require('./parse')
const flatten = require('./flatten')

async function analyze(location, options) {
  options = {
    etag: null,
    lastCheckedAt: null,
    userAgent: 'plunger/1.0',
    fetchTimeout: 10000,
    inlineTypes: [
      'xml',
      'html',
      'txt',
      'json'
    ],
    digestAlgorithm: 'sha384',
    extractArchives: true,

    ...options
  }

  const u = url.parse(location)

  const token = {
    inputType: u.protocol ? 'url' : 'path',
    location
  }

  await parse(token, options)

  return token
}

function extractFiles(token, options) {
  options = {
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
        extensions: ['csv', 'tsv', 'dbf'],
        type: 'table'
      },
      {
        extensions: ['ecw', 'tiff', 'jp2'],
        type: 'image',
        format: 'raster'
      }
    ],

    ...options
  }

  return flatten(token, options)
}

module.exports = {analyze, extractFiles}
