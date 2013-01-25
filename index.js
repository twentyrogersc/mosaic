var helpers = require('./lib/helpers')
var moasic = require('./lib/moasic')
var path = require('path')


// config

var config = require('./config')
config.dims = helpers.dims(config.dims)
config.dir = path.join(__dirname, config.dir || 'images')
config.grid = helpers.dims(config.grid)
config.tmp = path.join(__dirname, 'tmp')
config.save = path.join(__dirname, config.save)


// go

moasic.make(config)