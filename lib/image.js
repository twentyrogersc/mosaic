var fs = require('fs')
var helpers = require('./helpers')
var request = require('request')

var exports = module.exports


// get/read image files

exports.get = function(url, dims, cb) {
  var req = { uri: url, encoding: 'binary' }
  request(req, function(err, res, body) {
    var buffer = new Buffer(body.toString(), 'binary')
    resize(buffer, dims, cb)
  })
}

exports.read = function(filePath, dims, cb) {
  fs.readFile(filePath, function(err, img) {
    resize(img, dims, cb)
  })
}


// resize images using canvas

var resize = exports.resize = function(buffer, dims, cb) {
  var img = new helpers.Image
  img.src = buffer

  var canvasW = dims.width
  var canvasH = dims.height
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
  
  var ctx = helpers.ctx(canvasW, canvasH)
  ctx.drawImage(img, imgX, imgY, imgW, imgH)

  var rtn = new Image(ctx, buffer)
  cb(rtn)
}


// image/pixels/rgb objects

var Image = exports.Image = function(ctx, buffer) {
  this.canvas = ctx.canvas
  this.ctx = ctx
  this.buffer = buffer || false
  this.width = this.canvas.width
  this.height = this.canvas.height
  this.pixels = new Pixels(ctx, this.width, this.height)

  this.save = function(filePath, cb) {
    helpers.save(this.canvas, filePath, cb)
  }

  this.saveOriginal = function(filePath, cb) {
    fs.writeFile(filePath, this.buffer, cb)
  }
}

var Pixels = function(ctx, w, h) {
  this.data = []
  this.length = w*h
  var avg = { r: 0, g: 0, b: 0 }
  var data = ctx.getImageData(0, 0, w, h).data
  for (var x=0; x<this.length*4; x+=4) {
    var rgb = new Rgb(data[x], data[x+1], data[x+2])
    avg.r += rgb.r/this.length
    avg.g += rgb.g/this.length
    avg.b += rgb.b/this.length
    this.data.push(rgb)
  }
  this.average = new Rgb(avg.r, avg.g, avg.b)
}

var Rgb = function(r, g, b) {
  this.r = Math.round(r)
  this.g = Math.round(g)
  this.b = Math.round(b)

  var average = false
  this.average = function() {
    if (average !== false) return average
    var add = this.r+this.g+this.b
    average = Math.round(add/3)
    return average
  }

  this.distanceFrom = function(rgb) {    
    var rSq = (this.r-rgb.r)*(this.r-rgb.r)
    var gSq = (this.g-rgb.g)*(this.g-rgb.g)
    var bSq = (this.b-rgb.b)*(this.b-rgb.b)
    return Math.sqrt(rSq+gSq+bSq)
  }

  this.toHex = function() {
    var toHex = function(val) {
      var hex = val.toString(16)
      return hex.length == 1 ? '0'+hex : hex
    }
    return '#'+toHex(r)+toHex(g)+toHex(b)
  }
}