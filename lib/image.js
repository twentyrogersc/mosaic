var Canvas = require('canvas')
var fs = require('fs')
var helpers = require('./helpers')
var request = require('request')

var image = module.exports


// get/read image files

var getOpts = { encoding: 'binary' }

image.get = function(file, dims, cb) {
  var method = helpers.isUrl(file) ? get : fs.readFile
  method(file, function(err, buffer) {
    if (err) return console.log('error')
    if (typeof dims === 'function') cb = dims
    if (typeof dims !== 'object') dims = false
    
    var img = resize(buffer, dims)
    buffer = null
    cb(img)
  })
}

var get = function(url, cb) {
  getOpts.uri = url
  request(getOpts, function(err, res, body) {
    if (err) return cb(err)
    var buffer = new Buffer(body.toString(), 'binary')
    cb(null, buffer)
  })
}


// resize and return canvas context

var resize = exports.resize = function(buffer, dims) {
  var img = new Canvas.Image
  img.src = buffer

  var canvasW = dims ? dims.width : img.width
  var canvasH = dims ? dims.height : img.height
  var imgW = canvasW
  var imgH = canvasH
  var imgX = 0
  var imgY = 0

  var wRatio = canvasW/img.width
  var hRatio = canvasH/img.height

  if (wRatio < hRatio) {
    imgW = img.width*hRatio
    imgX = -parseInt((imgW-canvasW)/2, 10)
  }
  else if (wRatio > hRatio) {
    imgH = img.height*wRatio
    imgY = -parseInt((imgH-canvasH)/2, 10)
  }
  
  var ctx = image.ctx(canvasW, canvasH)
  ctx.drawImage(img, imgX, imgY, imgW, imgH)
  img = null
  return ctx
}


// create a canvas context object

image.ctx = function(w, h) {
  var canvas = new Canvas(w, h)
  var ctx = canvas.getContext('2d')
  canvas = null
  return ctx
}


// save image contexts

image.save = function(ctx, save, cb) {
  var out = fs.createWriteStream(save)
  var stream = ctx.canvas.createJPEGStream()
  
  stream.on('data', function(chunk) {
    out.write(chunk)
  }).on('end', function() {
    out.end()
    cb()
  })
}


// get pixel data

image.pixels = function(ctx) {
  var h = ctx.canvas.height
  var w = ctx.canvas.width
  var length = h*w
  
  var pixels = []
  var data = ctx.getImageData(0, 0, w, h).data
  
  for (var x=0; x<length*4; x+=4) {
    var r = data[x]
    var g = data[x+1]
    var b = data[x+2]
    var avg = Math.round((r+g+b)/3)
    pixels.push([r, g, b, avg])
  }
  
  return pixels
}


// average [r,g,b,avg] of pixels

image.average = function(ctx, pixels) {
  pixels = pixels || image.pixels(ctx)
  
  var avg = [0, 0, 0, 0]
  var length = pixels.length
  for (var x=0; x<length; x++) {
    avg[0] += pixels[x][0]/length
    avg[1] += pixels[x][1]/length
    avg[2] += pixels[x][2]/length
    avg[3] += pixels[x][3]/length
  }
  
  avg.forEach(function(val, x) {
    avg[x] = Math.round(val)
  })
  
  pixels = null
  return avg
}


// calculate distance between two colors

image.distance = function(a, b) {
  var rSq = (a[0]-b[0])*(a[0]-b[0])
  var gSq = (a[1]-b[1])*(a[1]-b[1])
  var bSq = (a[2]-b[2])*(a[2]-b[2])
  return Math.sqrt(rSq+gSq+bSq)
}


// convert rgb array to hex

image.hex = function(pixel) {
  var r = hex(pixel[0])
  var g = hex(pixel[1])
  var b = hex(pixel[2])
  return '#'+r+g+b
}

var hex = function(val) {
  val = val.toString(16)
  return val.length == 1 ? '0'+val : val
}