'use strict'

const url = require('node:url')
const contentDisposition = require('content-disposition')
const rfc2047 = require('rfc2047')

function analyzeName(token) {
  if (token.analyzed) {
    return false
  }

  const cdHeader = token.response.headers['content-disposition']
  if (cdHeader) {
    const cd = contentDisposition.parse(cdHeader)
    if (cd.parameters.filename) {
      token.fileName = rfc2047.decode(cd.parameters.filename)
    }
  }

  if (!token.fileName) {
    const {pathname} = url.parse(token.finalUrl)
    const fileName = pathname.split('/').pop()
    if (fileName) {
      token.fileName = decodeURIComponent(fileName)
    }
  }
}

module.exports = analyzeName
