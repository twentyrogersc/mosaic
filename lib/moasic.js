var async = require('async')
var fs = require('fs')
var helpers = require('./helpers')
var image = require('./image')
var path = require('path')


// start by loading main image

module.exports.make = function(config) {
  var isUrl = !! config.img.match(/^http(s|):\/\//)
  var method = isUrl ? 'get' : 'read'
   
  image[method](config.img, config.grid, function(img) {
    var filePath = path.join(config.save, 'pixels.jpg')
    img.save(filePath, function() {
      checkDirectories(config, img)
    })
  })
}


// create public directories if does not exist

var checkDirectories = function(config, img) {
  var dirs = ['originals', 'thumbs']
  async.forEachSeries(dirs, function(dir, next) {
    dir = path.join(config.save, dir)
    fs.exists(dir, function (exists) {
      if (exists) return next()
      fs.mkdir(dir, next)
    })
  }, function() {
    getFiles(config, img)
  })
}


// get list of image in directory

var getFiles = function(config, img) {
  var paths = []
  fs.readdir(config.dir, function(err, res) {
    res.forEach(function(file) {
      if (file.match(/\.jpg$/)) {
        file = path.join(config.dir, file)
        paths.push(file)
      }
    })
    loadFiles(config, img, paths)
  })
}


// load images into memory

var loadFiles = function(config, img, paths) {
  var imgs = []
  async.forEachSeries(paths, function(filePath, next) {
    image.read(filePath, config.dims, function(img) {
      imgs.push(img)
      next()
    })
  }, function(err) {
    imgs.sort(function(a, b) {
      var aAvg = a.pixels.average
      var bAvg = b.pixels.average
      var totalA = aAvg.r+aAvg.g+aAvg.b
      var totalB = bAvg.r+bAvg.g+bAvg.b
      return totalB-totalA
    })
    placePixels(config, img, imgs)
  })
}


// match pixel to closest colour

var placePixels = function(config, img, imgs) {
  var tiles = []
  var final = []
  
  for (var x=0; x<img.pixels.length; x++) {
    tiles.push({ num: x, pixel: img.pixels.data[x] })
  }
  
  async.forEachSeries(imgs, function(img, next) {
    if (tiles.length === 0) {
      return next()
    }
    
    var minDist = 999999999999999
    var tileKey = 0
    
    tiles.forEach(function(tile, key) {
      var dist = img.pixels.average.distanceFrom(tile.pixel)
      if (dist < minDist) {
        minDist = dist
        tileKey = key
      }
    })
    
    var tile = tiles.splice(tileKey, 1)[0]
    savePixel(config, tile, img, function(pixel) {
      final[tile.num] = pixel
      next()
    })
  }, function() {
    comp(config, final)
  })
}


// saves and tints a pixel

var savePixel = function(config, tile, img, cb) {
  var h = img.canvas.height
  var w = img.canvas.width
  
  var ctx = helpers.ctx(w, h)
  ctx.fillStyle = tile.pixel.toHex()
  ctx.fillRect(0, 0, w, h)
  
  ctx.globalAlpha = 0.7
  ctx.drawImage(img.canvas, 0, 0)
  
  var tint = new image.Image(ctx)
  var fileName = tile.num+'.jpg'
  var filePath = path.join(config.save, 'originals', fileName)
  img.saveOriginal(filePath, function() {
    filePath = path.join(config.save, 'thumbs', fileName)
    tint.save(filePath, function() {
      cb(tint)
    })
  })
}


// make moasic comp

var comp = function(config, imgs) {
  var grid = config.grid
  var dims = config.dims
  var w = grid.width*dims.width
  var h = grid.height*dims.height
  var ctx = helpers.ctx(w, h)
  
  for (var y=0; y<grid.height; y++) {
    for (var x=0; x<grid.width; x++) {
      var xPos = x*dims.width
      var yPos = y*dims.height
      var key = (y*grid.width)+x
      var pixel = imgs[key]
      ctx.drawImage(pixel.canvas, xPos, yPos, dims.width, dims.height)
    }
  }
  
  var filePath = path.join(config.save, 'moasic.jpg')
  helpers.save(ctx.canvas, filePath)
}