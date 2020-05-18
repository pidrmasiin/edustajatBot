const http = require('http')
const express = require('express')
const app = express()
const config = require('./config')
const schedule = require('./schedule')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

function requestLogger(httpModule){
    var original = httpModule.request
    httpModule.request = function(options, callback){
      console.log(options.href||options.proto+"://"+options.host+options.path, options.method, options.headers)
      return original(options, callback)
    }
  }
  
  requestLogger(require('http'))
  requestLogger(require('https'))

  schedule.twitterBot

const server = http.createServer(app)

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${config.port}`)
})

module.exports = {
  app, server
}