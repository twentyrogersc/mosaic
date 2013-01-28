var config = require('./config')
var helpers = require('./lib/helpers')
var moasic = require('./lib/moasic')
var path = require('path')
var video = require('./lib/video')


// config

var videoExts = new RegExp('.(mov|mp4|avi)$')
var isVideo = videoExts.test(config.src)
var isUrl = helpers.isUrl(config.src)
var ext = isVideo ? 'mp4' : 'jpg'

config.dims = helpers.dims(config.dims)
config.grid = helpers.dims(config.grid)
config.dir = path.join(__dirname, config.dir || 'images')
config.fps = config.fps ? parseInt(config.fps) : 6
config.save = path.join(__dirname, config.save || 'moasic.'+ext)
config.src = isUrl ? config.src : path.join(__dirname, config.src)
config.tint = config.tint ? parseFloat(config.tint) : 0.7
config.tmp = path.join(__dirname, config.tmp || 'tmp')

config.cb = function() {
  helpers.rmdirp(config.tmp)
}


// use moasic/video module depending on config.src

if (isVideo) video.make(config)
else moasic.make(config)