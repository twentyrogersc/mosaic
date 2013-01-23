var Canvas = require('canvas')
var fs = require('fs')

var helpers = module.exports


// canvas stuff

helpers.ctx = function(w, h) {
  var canvas = new Canvas(w, h)
  return canvas.getContext('2d')
}

helpers.save = function(canvas, filePath, cb) {
  var out = fs.createWriteStream(filePath)
  var stream = canvas.createJPEGStream()
  stream.on('data', function(chunk) {
    out.write(chunk)
  }).on('end', function() {
    out.end()
    if (cb) cb()
  })
}

helpers.Image = Canvas.Image


// turn #x# string into { width: #, height: # }

helpers.dims = function(str) {
  var split = str.split('x')
  var w = parseInt(split[0], 10)
  var h = parseInt(split[1], 10)
  return { width: w, height: h }
}