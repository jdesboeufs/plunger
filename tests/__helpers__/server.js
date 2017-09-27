const http = require('http')
const path = require('path')
const listen = require('test-listen')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')

function createServer(handler) {
  return listen(http.createServer(handler))
}

function serveDirectory(location, options) {
  const serve = serveStatic(location, options)

  return createServer((req, res) => {
    serve(req, res, finalhandler(req, res))
  })
}

function serveFile(location) {
  return serveDirectory(path.dirname(location), {
    index: path.basename(location)
  })
}

function serveRedirect(target, httpCode = 302) {
  return createServer((req, res) => {
    res.writeHead(httpCode, {
      location: target
    })
    res.end()
  })
}

module.exports = {serveFile, serveDirectory, serveRedirect}
