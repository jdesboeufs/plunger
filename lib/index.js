'use strict'

const path = require('path')
const url = require('url')

const analyze = require('./analyze')
const flatten = require('./flatten')
const defaultLogger = require('./logger')

async function analyzeLocation(location, options) {
  options = {
    etag: null,
    lastCheckedAt: null,
    userAgent: 'plunger/1.0',
    fetchTimeout: 10000,
    digestAlgorithm: 'sha384',
    extractArchives: true,
    indexOfMatches: [
      /Directory of/,
      /Index of/,
      /Listing of/,
      /Cr&eacute;ation du fichier :/
    ],
    logger: defaultLogger,

    ...options
  }

  const u = url.parse(location)

  const token = u.protocol ? {
    inputType: 'url',
    url: location
  } : {
    inputType: 'path',
    path: path.resolve(location)
  }

  await analyze(token, options)

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
    ],

    ...options
  }

  return flatten(token, options)
}

module.exports = {analyzeLocation, extractFiles}
