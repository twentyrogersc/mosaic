var async = require('async')
var ffmpeg = require('fluent-ffmpeg')
var helpers = require('./helpers')
var moasic = require('./moasic')
var path = require('path')


// go

module.exports.make = function(config) {
  config.frames = path.join(config.tmp, 'frames')
  helpers.mkdirp(config.frames, function() {
    meta(config)
  })
}


// get meta about a video

var meta = function(config) {
  helpers.log('reading', path.basename(config.src))
  
  new ffmpeg.Metadata(config.src).get(function(data) {
    var res = data.video.resolution
    data.duration = parseInt(data.durationsec, 10)
    data.resolution = res.w+'x'+res.h
    frames(config, data)
  })
}


// get screen caps from video

var frames = function(config, data) {
  helpers.log('extracting', path.basename(config.src))
  
  config.opts = timemarks(config, data)
  new ffmpeg({ source: config.src })
    .withSize(data.resolution)
    .takeScreenshots(config.opts, config.frames, function(err, files) {
      convert(config, files)
    })
}

var timemarks = function(config, data) {
  var opts = { timemarks: [], filename: '%' }
  opts.count = Math.ceil(data.duration*config.fps)+1
  
  var int = 1/config.fps
  for (var x=0; x<opts.count; x++) opts.timemarks.push(''+(x*int))
  
  var zeros = (opts.count+'').length
  for (x=0; x<zeros-1; x++) opts.filename += '0'
  opts.input = '%0'+zeros+'d.jpg'
  opts.filename += 'i'
  
  return opts
}


// overwrite frames with moasics

var convert = function(config, files) {
  var c = helpers.clone(config)
  c.tmp = path.join(config.tmp, 'moasic')
  
  async.forEachSeries(files, function(file, next) {
    c.cb = next
    c.src = path.join(config.frames, file)
    c.save = path.join(config.frames, file)
    moasic.make(c)
  }, function() {
    comp(config)
  })
}


// create video from moasic frames

var comp = function(config) {
  helpers.log('saving', path.basename(config.save))
  var source = path.join(config.frames, config.opts.input)
  new ffmpeg({ source: '' })
    .addOption('-s', config.width+'x'+config.height)
    .addOption('-r', config.fps)
    .addOption('-i', source)
    .saveToFile(config.save, config.cb)
}