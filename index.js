const http = require('http')
const express = require('express')
const app = express()
const vaskiData = require('./vaskidata')
const config = require('./config')

function requestLogger(httpModule){
    var original = httpModule.request
    httpModule.request = function(options, callback){
      console.log(options.href||options.proto+"://"+options.host+options.path, options.method, options.headers)
      return original(options, callback)
    }
  }
  
  requestLogger(require('http'))
  requestLogger(require('https'))

  vaskiData.getSpeaks('janimäkelä')

const server = http.createServer(app)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

module.exports = {
  app, server
}