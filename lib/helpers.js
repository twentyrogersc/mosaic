var Canvas = require('canvas')
var colors = require('colors')
var fs = require('fs')

var helpers = module.exports


// turn #x# string into { width: #, height: # }

helpers.dims = function(str) {
  var split = str.split('x')
  var w = parseInt(split[0], 10)
  var h = parseInt(split[1], 10)
  return { width: w, height: h }
}


// logging with colors.js

helpers.log = function(action, meta) {
  console.log(action, (meta || '').grey)
}