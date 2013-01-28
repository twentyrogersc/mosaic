var async = require('async')
var Canvas = require('canvas')
var colors = require('colors')
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')

var helpers = module.exports


// makes directory (github.com/substack/node-mkdirp)

helpers.mkdirp = mkdirp


// remove directory and contents

helpers.rmdirp = function(dir, cb) {
  fs.readdir(dir, function(err, files) {
    files = files || []
    async.forEachSeries(files, function(file, next) {
      file = path.join(dir, file)
      fs.stat(file, function(err, stats) {
        var isDir = stats.isDirectory()
        if (isDir) helpers.rmdirp(file, next)
        else fs.unlink(file, next)
      })
    }, function() {
      fs.rmdir(dir, function() {
        if (cb) cb()
      })
    })
  })  
}


// clone an object

helpers.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj))
}


// turn #x# string into { width: #, height: # }

helpers.dims = function(str) {
  var split = str.split('x')
  var w = parseInt(split[0], 10)
  var h = parseInt(split[1], 10)
  return { width: w, height: h }
}


// logging with colors.js

helpers.log = function(action, a, b) {
  action = action.cyan.underline
  console.log(action, (a || '').grey, (b || '').grey)
}


// tests whether string is a url

var isUrl = new RegExp('^http(s|)://')

helpers.isUrl = function(str) {
  return isUrl.test(str)
}