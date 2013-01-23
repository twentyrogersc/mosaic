var app = require('teller')
var ejs = require('ejs')
var fs = require('fs')
var path = require('path')


// create basic server

module.exports.go = function(params, port) {
  var serve = function(rendered) {
    return function(req, res) {
      res.end(rendered)
    }
  }
  
  var settings = { static: { route: '/public', dir: params.save } }
  var saveTo = path.join(params.save, 'index.html')
  var template = path.join(params.cwd, 'templates/index.ejs')
  
  render(template, saveTo, params, function(rendered) {
    app.get('/', serve(rendered)).settings(settings).listen(port)
  })
}


// render html

var render = function(template, save, params, cb) {
  fs.readFile(template, function(err, html) {
    var rendered = ejs.render(html.toString(), params)
    fs.writeFile(save, rendered, function() {
      cb(rendered)
    })
  })
}