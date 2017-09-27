const http = require('http')
const fs = require('fs')
const listen = require('test-listen')

function serveFile(location) {
  const srv = http.createServer(
    (req, res) => {
      fs.createReadStream(location).pipe(res)
    }
  )

  return listen(srv)
}

module.exports = {serveFile}
